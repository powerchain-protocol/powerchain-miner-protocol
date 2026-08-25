-- PowerChain Agent Compute — canonical schema migration 008
-- Wallet-funded compute accounts, scoped API keys, usage authorization,
-- append-only billing ledger and wallet top-up intents.

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  slug text NOT NULL,
  wallet_chain text NOT NULL CHECK (wallet_chain IN ('solana','sui')),
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','SUSPENDED','ARCHIVED')),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, slug),
  UNIQUE(client_id, wallet_chain, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_agents_client_status
  ON agents(client_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS agent_compute_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','SUSPENDED')),
  endpoint_base_url text NOT NULL DEFAULT 'https://compute.powerchain.energy/v1',
  auto_topup_enabled boolean NOT NULL DEFAULT false,
  preferred_chain text NOT NULL DEFAULT 'solana'
    CHECK (preferred_chain IN ('solana','sui')),
  preferred_asset_symbol text,
  topup_amount_microunits numeric(30,0) NOT NULL DEFAULT 0
    CHECK (topup_amount_microunits >= 0),
  low_balance_threshold_microunits numeric(30,0) NOT NULL DEFAULT 0
    CHECK (low_balance_threshold_microunits >= 0),
  max_auto_topup_per_day_microunits numeric(30,0) NOT NULL DEFAULT 0
    CHECK (max_auto_topup_per_day_microunits >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compute_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE CHECK (key_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','REVOKED')),
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_compute_api_keys_agent_status
  ON compute_api_keys(agent_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS compute_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_model text NOT NULL UNIQUE,
  upstream_model text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  input_rate_microunits_per_1k numeric(30,0) NOT NULL
    CHECK (input_rate_microunits_per_1k >= 0),
  output_rate_microunits_per_1k numeric(30,0) NOT NULL
    CHECK (output_rate_microunits_per_1k >= 0),
  cached_input_rate_microunits_per_1k numeric(30,0)
    CHECK (
      cached_input_rate_microunits_per_1k IS NULL
      OR cached_input_rate_microunits_per_1k >= 0
    ),
  max_output_tokens integer NOT NULL DEFAULT 8192
    CHECK (max_output_tokens BETWEEN 1 AND 200000),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compute_usage_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL UNIQUE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  api_key_id uuid NOT NULL REFERENCES compute_api_keys(id),
  model_id uuid NOT NULL REFERENCES compute_models(id),
  reserved_microunits numeric(30,0) NOT NULL
    CHECK (reserved_microunits >= 0),
  status text NOT NULL DEFAULT 'AUTHORIZED'
    CHECK (status IN ('AUTHORIZED','SETTLED','RELEASED','FAILED')),
  input_tokens bigint,
  cached_input_tokens bigint,
  output_tokens bigint,
  actual_microunits numeric(30,0),
  provider_request_id text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  settled_at timestamptz,
  released_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_compute_authorizations_agent_status
  ON compute_usage_authorizations(agent_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS compute_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  authorization_id uuid REFERENCES compute_usage_authorizations(id),
  topup_intent_id uuid,
  entry_type text NOT NULL
    CHECK (entry_type IN ('TOPUP_CREDIT','USAGE_DEBIT','ADJUSTMENT')),
  amount_microunits numeric(30,0) NOT NULL
    CHECK (amount_microunits >= 0),
  balance_effect_microunits numeric(30,0) NOT NULL,
  memo text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);



ALTER TABLE compute_ledger
  ADD CONSTRAINT compute_ledger_entry_semantics CHECK (
    (
      entry_type='TOPUP_CREDIT'
      AND balance_effect_microunits=amount_microunits
    )
    OR
    (
      entry_type='USAGE_DEBIT'
      AND balance_effect_microunits=-amount_microunits
    )
    OR
    entry_type='ADJUSTMENT'
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_compute_ledger_usage_debit
  ON compute_ledger(authorization_id,entry_type)
  WHERE authorization_id IS NOT NULL AND entry_type='USAGE_DEBIT';

CREATE OR REPLACE FUNCTION reject_compute_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'compute_ledger is append-only; add a compensating entry instead';
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_ledger_immutable ON compute_ledger;
CREATE TRIGGER trg_compute_ledger_immutable
BEFORE UPDATE OR DELETE ON compute_ledger
FOR EACH ROW
EXECUTE FUNCTION reject_compute_ledger_mutation();

CREATE TABLE IF NOT EXISTS compute_funding_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain text NOT NULL CHECK (chain IN ('solana','sui')),
  symbol text NOT NULL,
  asset_identifier text NOT NULL,
  treasury_destination text NOT NULL,
  decimals integer NOT NULL CHECK (decimals BETWEEN 0 AND 18),
  credit_microunits_per_base_unit numeric(30,0) NOT NULL
    CHECK (credit_microunits_per_base_unit > 0),
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(chain,symbol)
);

CREATE TABLE IF NOT EXISTS compute_topup_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  funding_asset_id uuid NOT NULL REFERENCES compute_funding_assets(id),
  requested_credit_microunits numeric(30,0) NOT NULL
    CHECK (requested_credit_microunits > 0),
  required_asset_base_units numeric(30,0) NOT NULL
    CHECK (required_asset_base_units > 0),
  status text NOT NULL DEFAULT 'AWAITING_WALLET'
    CHECK (
      status IN (
        'AWAITING_WALLET',
        'SUBMITTED',
        'CONFIRMED',
        'FAILED',
        'EXPIRED',
        'CANCELLED'
      )
    ),
  trigger text NOT NULL DEFAULT 'MANUAL'
    CHECK (trigger IN ('MANUAL','AUTO_THRESHOLD','INSUFFICIENT_BALANCE')),
  wallet_address text NOT NULL,
  transaction_signature text UNIQUE,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes',
  submitted_at timestamptz,
  confirmed_at timestamptz,
  failure_reason text
);

ALTER TABLE compute_ledger
  DROP CONSTRAINT IF EXISTS compute_ledger_topup_intent_id_fkey;

ALTER TABLE compute_ledger
  ADD CONSTRAINT compute_ledger_topup_intent_id_fkey
  FOREIGN KEY (topup_intent_id)
  REFERENCES compute_topup_intents(id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_compute_ledger_topup_credit
  ON compute_ledger(topup_intent_id,entry_type)
  WHERE topup_intent_id IS NOT NULL AND entry_type='TOPUP_CREDIT';

CREATE INDEX IF NOT EXISTS idx_compute_topups_agent_status
  ON compute_topup_intents(agent_id,status,created_at DESC);

CREATE OR REPLACE VIEW agent_compute_balances AS
SELECT
  a.id AS agent_id,
  COALESCE(SUM(l.balance_effect_microunits),0)::numeric(30,0)
    AS balance_microunits
FROM agents a
LEFT JOIN compute_ledger l ON l.agent_id=a.id
GROUP BY a.id;
