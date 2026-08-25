ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS verifier_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS chain_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS chain_confirmed_at timestamptz;

ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS firmware_version text,
  ADD COLUMN IF NOT EXISTS source_rotated_at timestamptz;

ALTER TABLE client_api_keys
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE reward_ledger
  ADD COLUMN IF NOT EXISTS claim_id uuid REFERENCES reward_claims(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_ledger_proof_accrual
  ON reward_ledger(proof_id)
  WHERE proof_id IS NOT NULL AND entry_type='ACCRUAL';

CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_ledger_claim_hold
  ON reward_ledger(claim_id)
  WHERE claim_id IS NOT NULL AND entry_type='CLAIM_HOLD';

CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_ledger_claim_settlement
  ON reward_ledger(claim_id)
  WHERE claim_id IS NOT NULL AND entry_type='SETTLEMENT';

CREATE INDEX IF NOT EXISTS idx_proofs_verifier_queue
  ON proofs(chain_status, next_retry_at, received_at)
  WHERE status='VERIFIED';

CREATE TABLE IF NOT EXISTS device_source_rotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  previous_source_hash text,
  next_source_hash text NOT NULL,
  reason text NOT NULL,
  approved_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS software_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('stable','beta','canary')),
  platform text NOT NULL CHECK (platform IN ('linux','raspberrypi')),
  architecture text NOT NULL CHECK (architecture IN ('arm64','x86_64')),
  artifact_url text NOT NULL,
  artifact_sha256 text NOT NULL CHECK (artifact_sha256 ~ '^[a-f0-9]{64}$'),
  manifest_signature text NOT NULL,
  minimum_version text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(version,channel,platform,architecture)
);

CREATE INDEX IF NOT EXISTS idx_software_releases_lookup
  ON software_releases(channel,platform,architecture,created_at DESC)
  WHERE active=true;
