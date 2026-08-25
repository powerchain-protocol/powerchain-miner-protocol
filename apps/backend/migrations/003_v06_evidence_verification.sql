DO $$ BEGIN
  CREATE TYPE proof_attestation_decision AS ENUM ('APPROVE','REJECT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS verification_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  renewable_type text NOT NULL CHECK (renewable_type IN ('solar','wind','hydro','battery','ev','other')),
  name text NOT NULL,
  min_attestations integer NOT NULL DEFAULT 1 CHECK (min_attestations BETWEEN 1 AND 10),
  min_quality_bps integer NOT NULL DEFAULT 9000 CHECK (min_quality_bps BETWEEN 1 AND 10000),
  max_energy_wh_per_proof bigint NOT NULL DEFAULT 10000000 CHECK (max_energy_wh_per_proof > 0),
  max_average_power_w bigint,
  require_source_continuity boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_verification_policy_active_source
  ON verification_policies(client_id, renewable_type)
  WHERE active=true;

CREATE TABLE IF NOT EXISTS proof_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  verifier_id text NOT NULL,
  decision proof_attestation_decision NOT NULL,
  quality_bps integer NOT NULL CHECK (quality_bps BETWEEN 1 AND 10000),
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proof_id, verifier_id)
);

ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS reward_policy_id uuid REFERENCES reward_policies(id),
  ADD COLUMN IF NOT EXISTS reward_epoch_id uuid REFERENCES reward_epochs(id),
  ADD COLUMN IF NOT EXISTS verification_policy_id uuid REFERENCES verification_policies(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS last_proof_digest text,
  ADD COLUMN IF NOT EXISTS source_hash text;

ALTER TABLE proofs
  DROP CONSTRAINT IF EXISTS proofs_quality_bps_check;

ALTER TABLE proofs
  ADD CONSTRAINT proofs_quality_bps_check CHECK (quality_bps BETWEEN 0 AND 10000);

ALTER TABLE proofs ALTER COLUMN quality_bps SET DEFAULT 0;
ALTER TABLE proofs ALTER COLUMN status SET DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS idx_proofs_evidence_queue
  ON proofs(status, received_at)
  WHERE status='PENDING';

CREATE INDEX IF NOT EXISTS idx_attestations_proof
  ON proof_attestations(proof_id, decision);

-- Existing installations may already contain verified proofs. Those remain valid historical records.
