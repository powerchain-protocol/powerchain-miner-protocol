CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('ACTIVE','SUSPENDED','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membership_role AS ENUM ('CLIENT_ADMIN','OPERATOR','FINANCE','VERIFIER','VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('ACTIVE','SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reward_epoch_status AS ENUM ('OPEN','CALCULATING','READY','CLOSED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reward_claim_status AS ENUM ('REQUESTED','APPROVED','REJECTED','SUBMITTED','CONFIRMED','FAILED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reward_entry_type AS ENUM ('ACCRUAL','ADJUSTMENT','CLAIM_HOLD','CLAIM_RELEASE','SETTLEMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  is_superadmin boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  legal_name text,
  country_code char(2),
  status client_status NOT NULL DEFAULT 'ACTIVE',
  treasury_wallet text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS client_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  last_used_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS client_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  status membership_status NOT NULL DEFAULT 'ACTIVE',
  reward_wallet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  external_device_id text NOT NULL,
  label text NOT NULL,
  renewable_type text NOT NULL CHECK (renewable_type IN ('solar','wind','hydro','battery','ev','other')),
  public_key_pem text NOT NULL,
  source text NOT NULL,
  status text NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE','OFFLINE','WARNING','DISABLED')),
  owner_user_id uuid REFERENCES users(id),
  onchain_device_pda text,
  onchain_miner_pda text,
  last_sequence bigint NOT NULL DEFAULT 0,
  total_energy_wh bigint NOT NULL DEFAULT 0,
  total_reward_base_units numeric(30,0) NOT NULL DEFAULT 0,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, external_device_id),
  UNIQUE(public_key_pem)
);

CREATE TABLE IF NOT EXISTS proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  sequence bigint NOT NULL,
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  energy_delta_wh bigint NOT NULL CHECK (energy_delta_wh > 0),
  average_power_w bigint NOT NULL DEFAULT 0,
  sample_count integer NOT NULL DEFAULT 0,
  reported_quality_bps integer NOT NULL DEFAULT 10000 CHECK (reported_quality_bps BETWEEN 1 AND 10000),
  quality_bps integer NOT NULL DEFAULT 10000 CHECK (quality_bps BETWEEN 1 AND 10000),
  source_hash text NOT NULL DEFAULT repeat('0', 64),
  previous_digest text,
  proof_digest text NOT NULL,
  signature text NOT NULL,
  status text NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
  chain_status text NOT NULL DEFAULT 'PENDING' CHECK (chain_status IN ('PENDING','SUBMITTED','CONFIRMED','FAILED')),
  chain_signature text,
  chain_error text,
  reward_base_units numeric(30,0) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id, sequence),
  UNIQUE(proof_digest)
);

CREATE TABLE IF NOT EXISTS reward_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  renewable_type text NOT NULL CHECK (renewable_type IN ('solar','wind','hydro','battery','ev','other')),
  unit text NOT NULL DEFAULT 'Wh' CHECK (unit = 'Wh'),
  base_units_per_unit bigint NOT NULL CHECK (base_units_per_unit > 0),
  max_per_proof_base_units bigint NOT NULL CHECK (max_per_proof_base_units > 0),
  daily_cap_base_units bigint,
  quality_bps integer NOT NULL DEFAULT 10000 CHECK (quality_bps BETWEEN 1 AND 10000),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS reward_epochs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES reward_policies(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status reward_epoch_status NOT NULL DEFAULT 'OPEN',
  total_energy_wh bigint NOT NULL DEFAULT 0,
  total_reward_base_units numeric(30,0) NOT NULL DEFAULT 0,
  closed_by uuid REFERENCES users(id),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  device_id uuid REFERENCES devices(id),
  proof_id uuid REFERENCES proofs(id),
  epoch_id uuid REFERENCES reward_epochs(id),
  policy_id uuid REFERENCES reward_policies(id),
  entry_type reward_entry_type NOT NULL,
  amount_base_units numeric(30,0) NOT NULL,
  balance_effect numeric(30,0) NOT NULL,
  memo text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES users(id),
  epoch_id uuid REFERENCES reward_epochs(id),
  amount_base_units numeric(30,0) NOT NULL CHECK (amount_base_units > 0),
  destination_wallet text NOT NULL,
  status reward_claim_status NOT NULL DEFAULT 'REQUESTED',
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  chain_signature text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treasury_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  network text NOT NULL CHECK (network IN ('devnet','mainnet-beta')),
  mint text NOT NULL,
  treasury_wallet text NOT NULL,
  balance_base_units numeric(30,0) NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id),
  actor_email text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON client_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_devices_client ON devices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_proofs_client_received ON proofs(client_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_proofs_device_seq ON proofs(device_id, sequence DESC);
CREATE INDEX IF NOT EXISTS idx_reward_policies_client ON reward_policies(client_id, active);
CREATE INDEX IF NOT EXISTS idx_reward_epochs_client ON reward_epochs(client_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_client_user ON reward_ledger(client_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_claims_client_status ON reward_claims(client_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_client_created ON audit_logs(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_api_keys_hash ON client_api_keys(key_hash, status);
