-- Canonical v1.0.0 internal schema evolution.
-- Multi-worker proof settlement leases and durable Solana settlement intents.

ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS settlement_lease_id uuid,
  ADD COLUMN IF NOT EXISTS settlement_lease_owner text,
  ADD COLUMN IF NOT EXISTS settlement_lease_until timestamptz,
  ADD COLUMN IF NOT EXISTS settlement_attempt_count integer NOT NULL DEFAULT 0
    CHECK (settlement_attempt_count >= 0),
  ADD COLUMN IF NOT EXISTS settlement_last_error text,
  ADD COLUMN IF NOT EXISTS settlement_last_attempt_at timestamptz;

UPDATE proofs
   SET settlement_attempt_count=verifier_attempts
 WHERE verifier_attempts > settlement_attempt_count;

ALTER TABLE proofs
  DROP CONSTRAINT IF EXISTS proofs_settlement_lease_consistent;

ALTER TABLE proofs
  ADD CONSTRAINT proofs_settlement_lease_consistent CHECK (
    (
      settlement_lease_id IS NULL
      AND settlement_lease_owner IS NULL
      AND settlement_lease_until IS NULL
    )
    OR
    (
      settlement_lease_id IS NOT NULL
      AND settlement_lease_owner IS NOT NULL
      AND settlement_lease_until IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_proofs_settlement_lease_queue
  ON proofs(chain_status,next_retry_at,settlement_lease_until,received_at)
  WHERE status='VERIFIED'
    AND chain_status IN ('PENDING','FAILED','SUBMITTED');

CREATE TABLE IF NOT EXISTS proof_settlement_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid NOT NULL UNIQUE REFERENCES proofs(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'PREPARED'
    CHECK (state IN ('PREPARED','SUBMITTED','CONFIRMED','FAILED','UNKNOWN')),
  lease_id uuid NOT NULL,
  lease_owner text NOT NULL,
  transaction_signature text,
  recent_blockhash text NOT NULL,
  last_valid_block_height bigint NOT NULL CHECK (last_valid_block_height > 0),
  expected_sequence bigint NOT NULL CHECK (expected_sequence >= 0),
  expected_proof_digest text NOT NULL CHECK (expected_proof_digest ~ '^[a-f0-9]{64}$'),
  expected_device_pda text NOT NULL,
  expected_miner_pda text NOT NULL,
  attempt integer NOT NULL DEFAULT 1 CHECK (attempt > 0),
  submitted_at timestamptz,
  confirmed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_proof_settlement_intent_signature
  ON proof_settlement_intents(transaction_signature)
  WHERE transaction_signature IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proof_settlement_intents_state
  ON proof_settlement_intents(state,updated_at);

ALTER TABLE proof_settlement_intents
  DROP CONSTRAINT IF EXISTS proof_settlement_intent_state_fields;

ALTER TABLE proof_settlement_intents
  ADD CONSTRAINT proof_settlement_intent_state_fields CHECK (
    (state <> 'SUBMITTED' OR (transaction_signature IS NOT NULL AND submitted_at IS NOT NULL))
    AND (state <> 'CONFIRMED' OR (transaction_signature IS NOT NULL AND confirmed_at IS NOT NULL))
    AND (state <> 'FAILED' OR failed_at IS NOT NULL)
  );
