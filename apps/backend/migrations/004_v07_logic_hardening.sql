ALTER TABLE reward_claims
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS offline_after_seconds integer NOT NULL DEFAULT 120
    CHECK (offline_after_seconds BETWEEN 30 AND 86400);

CREATE INDEX IF NOT EXISTS idx_devices_stale
  ON devices(status,last_seen_at)
  WHERE status IN ('ONLINE','WARNING');

CREATE INDEX IF NOT EXISTS idx_claims_requester_state
  ON reward_claims(client_id,requested_by,status,created_at DESC);

-- One active claim can hold a given claim row exactly once; ledger uniqueness was added in 002.


ALTER TABLE verification_policies
  ADD COLUMN IF NOT EXISTS max_submission_delay_seconds integer NOT NULL DEFAULT 604800
    CHECK (max_submission_delay_seconds BETWEEN 60 AND 2592000);


ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS device_model text,
  ADD COLUMN IF NOT EXISTS queue_pending integer NOT NULL DEFAULT 0 CHECK (queue_pending >= 0),
  ADD COLUMN IF NOT EXISTS queue_dead integer NOT NULL DEFAULT 0 CHECK (queue_dead >= 0),
  ADD COLUMN IF NOT EXISTS last_temperature_c numeric(6,2),
  ADD COLUMN IF NOT EXISTS last_cpu_percent numeric(5,2);
