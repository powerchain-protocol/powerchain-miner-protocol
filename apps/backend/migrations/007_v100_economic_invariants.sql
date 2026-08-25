CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM reward_policies a
      JOIN reward_policies b
        ON a.id < b.id
       AND a.client_id=b.client_id
       AND a.renewable_type=b.renewable_type
       AND a.active=true
       AND b.active=true
       AND tstzrange(a.starts_at, COALESCE(a.ends_at, 'infinity'::timestamptz), '[)')
           &&
           tstzrange(b.starts_at, COALESCE(b.ends_at, 'infinity'::timestamptz), '[)')
  ) THEN
    RAISE EXCEPTION
      'Cannot install v1.0 reward-policy invariant: overlapping active reward policies exist.';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM reward_epochs a
      JOIN reward_epochs b
        ON a.id < b.id
       AND a.policy_id=b.policy_id
       AND a.status NOT IN ('CLOSED','CANCELLED')
       AND b.status NOT IN ('CLOSED','CANCELLED')
       AND tstzrange(a.starts_at, a.ends_at, '[)')
           &&
           tstzrange(b.starts_at, b.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION
      'Cannot install v1.0 reward-epoch invariant: overlapping active epochs exist.';
  END IF;
END $$;

ALTER TABLE reward_policies
  ADD CONSTRAINT reward_policies_no_active_overlap
  EXCLUDE USING gist (
    client_id WITH =,
    renewable_type WITH =,
    tstzrange(starts_at, COALESCE(ends_at, 'infinity'::timestamptz), '[)') WITH &&
  )
  WHERE (active=true);

ALTER TABLE reward_epochs
  ADD CONSTRAINT reward_epochs_no_active_overlap
  EXCLUDE USING gist (
    policy_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status NOT IN ('CLOSED','CANCELLED'));

ALTER TABLE reward_epochs
  ADD CONSTRAINT reward_epoch_time_order
  CHECK (ends_at > starts_at);

ALTER TABLE reward_policies
  ADD CONSTRAINT reward_policy_time_order
  CHECK (ends_at IS NULL OR ends_at > starts_at);

CREATE OR REPLACE FUNCTION reject_reward_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'reward_ledger is append-only; create a compensating entry instead of mutation';
END;
$$;

DROP TRIGGER IF EXISTS trg_reward_ledger_immutable ON reward_ledger;

CREATE TRIGGER trg_reward_ledger_immutable
BEFORE UPDATE OR DELETE ON reward_ledger
FOR EACH ROW
EXECUTE FUNCTION reject_reward_ledger_mutation();

ALTER TABLE reward_ledger
  ADD CONSTRAINT reward_ledger_entry_semantics CHECK (
    (entry_type='ACCRUAL'       AND amount_base_units > 0 AND balance_effect = amount_base_units)
    OR
    (entry_type='CLAIM_HOLD'    AND amount_base_units > 0 AND balance_effect = -amount_base_units)
    OR
    (entry_type='CLAIM_RELEASE' AND amount_base_units > 0 AND balance_effect = amount_base_units)
    OR
    (entry_type='SETTLEMENT'    AND amount_base_units > 0 AND balance_effect = 0)
    OR
    (entry_type='ADJUSTMENT'    AND amount_base_units >= 0)
  );

CREATE OR REPLACE FUNCTION reject_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION reject_audit_log_mutation();

ALTER TABLE reward_claims
  ADD COLUMN IF NOT EXISTS prepared_at timestamptz,
  ADD COLUMN IF NOT EXISTS claim_receipt_pda text,
  ADD COLUMN IF NOT EXISTS expected_miner_pda text,
  ADD COLUMN IF NOT EXISTS expected_destination_token_account text,
  ADD COLUMN IF NOT EXISTS claim_authorization_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS legacy_settlement_unverified boolean NOT NULL DEFAULT false;

UPDATE reward_claims
   SET legacy_settlement_unverified=true
 WHERE status='CONFIRMED'
   AND (
     confirmed_at IS NULL
     OR settlement_verified_at IS NULL
     OR chain_signature IS NULL
   );

CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_claim_receipt_pda
  ON reward_claims(claim_receipt_pda)
  WHERE claim_receipt_pda IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_scope text NOT NULL,
  audit_head_hash text NOT NULL CHECK (audit_head_hash ~ '^[a-f0-9]{64}$'),
  last_audit_id bigint,
  checkpoint_hash text NOT NULL CHECK (checkpoint_hash ~ '^[a-f0-9]{64}$'),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_checkpoints_scope_created
  ON audit_checkpoints(chain_scope, created_at DESC);

ALTER TABLE reward_claims
  ADD CONSTRAINT reward_claim_confirmed_fields CHECK (
    status <> 'CONFIRMED'
    OR legacy_settlement_unverified=true
    OR (
      confirmed_at IS NOT NULL
      AND settlement_verified_at IS NOT NULL
      AND chain_signature IS NOT NULL
    )
  );

ALTER TABLE reward_claims
  ADD CONSTRAINT reward_claim_approval_fields CHECK (
    status NOT IN ('APPROVED','SUBMITTED','CONFIRMED')
    OR (approved_by IS NOT NULL AND approved_at IS NOT NULL)
  );


ALTER TABLE reward_claims
  ADD CONSTRAINT reward_claim_preparation_fields CHECK (
    prepared_at IS NULL
    OR (
      claim_receipt_pda IS NOT NULL
      AND expected_miner_pda IS NOT NULL
      AND expected_destination_token_account IS NOT NULL
      AND claim_authorization_expires_at IS NOT NULL
    )
  );


CREATE OR REPLACE FUNCTION reject_audit_checkpoint_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_checkpoints is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_checkpoints_immutable
  ON audit_checkpoints;

CREATE TRIGGER trg_audit_checkpoints_immutable
BEFORE UPDATE OR DELETE ON audit_checkpoints
FOR EACH ROW
EXECUTE FUNCTION reject_audit_checkpoint_mutation();


ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS chain_reconciliation_method text
  CHECK (
    chain_reconciliation_method IS NULL
    OR chain_reconciliation_method IN ('TRANSACTION','STATE')
  );
