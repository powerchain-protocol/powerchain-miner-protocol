-- ------------------------------------------------------------------
-- Tamper-evident audit chain
-- ------------------------------------------------------------------

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS chain_scope text,
  ADD COLUMN IF NOT EXISTS previous_hash text,
  ADD COLUMN IF NOT EXISTS entry_hash text;

CREATE TABLE IF NOT EXISTS audit_chain_heads (
  chain_scope text PRIMARY KEY,
  head_hash text NOT NULL,
  last_audit_id bigint,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_audit_entry_hash
  ON audit_logs(entry_hash)
  WHERE entry_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION append_audit_log(
  p_actor_user_id uuid,
  p_actor_email text,
  p_action text,
  p_resource_type text,
  p_resource_id text,
  p_client_id uuid,
  p_metadata jsonb
)
RETURNS TABLE(audit_id bigint, audit_hash text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_scope text := COALESCE(p_client_id::text, 'platform');
  v_previous text;
  v_hash text;
  v_created_at timestamptz := clock_timestamp();
  v_id bigint;
BEGIN
  INSERT INTO audit_chain_heads(chain_scope, head_hash)
  VALUES (v_scope, repeat('0', 64))
  ON CONFLICT (chain_scope) DO NOTHING;

  SELECT head_hash
    INTO v_previous
    FROM audit_chain_heads
   WHERE chain_scope=v_scope
   FOR UPDATE;

  v_hash := encode(
    digest(
      concat_ws(
        '|',
        v_previous,
        v_scope,
        COALESCE(p_actor_user_id::text, ''),
        p_actor_email,
        p_action,
        p_resource_type,
        COALESCE(p_resource_id, ''),
        COALESCE(p_client_id::text, ''),
        COALESCE(p_metadata, '{}'::jsonb)::text,
        to_char(v_created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
      ),
      'sha256'
    ),
    'hex'
  );

  INSERT INTO audit_logs(
    actor_user_id,
    actor_email,
    action,
    resource_type,
    resource_id,
    client_id,
    metadata,
    created_at,
    chain_scope,
    previous_hash,
    entry_hash
  )
  VALUES (
    p_actor_user_id,
    p_actor_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_client_id,
    COALESCE(p_metadata, '{}'::jsonb),
    v_created_at,
    v_scope,
    v_previous,
    v_hash
  )
  RETURNING id INTO v_id;

  UPDATE audit_chain_heads
     SET head_hash=v_hash,
         last_audit_id=v_id,
         updated_at=v_created_at
   WHERE chain_scope=v_scope;

  RETURN QUERY SELECT v_id, v_hash;
END;
$$;

-- Historical rows predate hash chaining. New rows use append_audit_log.


CREATE OR REPLACE FUNCTION verify_audit_chain(p_scope text)
RETURNS TABLE(
  valid boolean,
  checked_rows bigint,
  first_invalid_audit_id bigint,
  expected_hash text,
  actual_hash text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous text := repeat('0', 64);
  v_expected text;
  v_count bigint := 0;
  r record;
BEGIN
  FOR r IN
    SELECT *
      FROM audit_logs
     WHERE chain_scope=p_scope
       AND entry_hash IS NOT NULL
     ORDER BY id
  LOOP
    v_count := v_count + 1;

    IF r.previous_hash IS DISTINCT FROM v_previous THEN
      RETURN QUERY
      SELECT false, v_count, r.id, v_previous, r.previous_hash;
      RETURN;
    END IF;

    v_expected := encode(
      digest(
        concat_ws(
          '|',
          v_previous,
          r.chain_scope,
          COALESCE(r.actor_user_id::text, ''),
          r.actor_email,
          r.action,
          r.resource_type,
          COALESCE(r.resource_id, ''),
          COALESCE(r.client_id::text, ''),
          COALESCE(r.metadata, '{}'::jsonb)::text,
          to_char(r.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
        ),
        'sha256'
      ),
      'hex'
    );

    IF v_expected IS DISTINCT FROM r.entry_hash THEN
      RETURN QUERY
      SELECT false, v_count, r.id, v_expected, r.entry_hash;
      RETURN;
    END IF;

    v_previous := r.entry_hash;
  END LOOP;

  RETURN QUERY SELECT true, v_count, NULL::bigint, NULL::text, NULL::text;
END;
$$;

-- ------------------------------------------------------------------
-- Generic API idempotency records
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS api_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  UNIQUE(actor_user_id, operation, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_expiry
  ON api_idempotency(expires_at);

-- ------------------------------------------------------------------
-- Source rotation becomes an approval workflow
-- ------------------------------------------------------------------

ALTER TABLE device_source_rotations
  ALTER COLUMN approved_by DROP NOT NULL;

ALTER TABLE device_source_rotations
  ADD COLUMN IF NOT EXISTS requested_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'APPROVED'
    CHECK (status IN ('REQUESTED','APPROVED','REJECTED','APPLIED','CANCELLED'));

UPDATE device_source_rotations
   SET requested_by=COALESCE(requested_by, approved_by),
       approved_at=COALESCE(approved_at, created_at)
 WHERE status='APPROVED';

CREATE INDEX IF NOT EXISTS idx_source_rotations_device_status
  ON device_source_rotations(device_id,status,created_at DESC);

-- ------------------------------------------------------------------
-- Claim settlement verification evidence
-- ------------------------------------------------------------------

ALTER TABLE reward_claims
  ADD COLUMN IF NOT EXISTS settlement_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS settlement_mint text,
  ADD COLUMN IF NOT EXISTS settlement_destination_token_account text,
  ADD COLUMN IF NOT EXISTS settlement_transfer_base_units numeric(30,0);


CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_claim_chain_signature
  ON reward_claims(chain_signature)
  WHERE chain_signature IS NOT NULL;
