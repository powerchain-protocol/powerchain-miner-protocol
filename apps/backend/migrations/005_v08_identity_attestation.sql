ALTER TABLE client_api_keys
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS device_signing_pubkey text,
  ADD COLUMN IF NOT EXISTS chain_binding_status text NOT NULL DEFAULT 'UNBOUND'
    CHECK (chain_binding_status IN ('UNBOUND','DERIVED','VERIFIED')),
  ADD COLUMN IF NOT EXISTS chain_binding_verified_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS ux_devices_signing_pubkey
  ON devices(device_signing_pubkey)
  WHERE device_signing_pubkey IS NOT NULL;

CREATE TABLE IF NOT EXISTS evidence_verifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  verifier_id text NOT NULL,
  name text NOT NULL,
  public_key_pem text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE(client_id, verifier_id),
  UNIQUE(public_key_pem)
);

CREATE TABLE IF NOT EXISTS verification_policy_verifiers (
  policy_id uuid NOT NULL REFERENCES verification_policies(id) ON DELETE CASCADE,
  verifier_id uuid NOT NULL REFERENCES evidence_verifiers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(policy_id, verifier_id)
);

ALTER TABLE verification_policies
  ADD COLUMN IF NOT EXISTS allow_human_verifiers boolean NOT NULL DEFAULT true;

ALTER TABLE proof_attestations
  ADD COLUMN IF NOT EXISTS verifier_registry_id uuid REFERENCES evidence_verifiers(id),
  ADD COLUMN IF NOT EXISTS attestation_digest text,
  ADD COLUMN IF NOT EXISTS signature text;

CREATE UNIQUE INDEX IF NOT EXISTS ux_proof_service_attestation
  ON proof_attestations(proof_id, verifier_registry_id)
  WHERE verifier_registry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_policy_verifier_policy
  ON verification_policy_verifiers(policy_id, verifier_id);


ALTER TABLE proof_attestations
  ADD COLUMN IF NOT EXISTS attestor_user_id uuid REFERENCES users(id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_proof_human_attestation
  ON proof_attestations(proof_id, attestor_user_id)
  WHERE attestor_user_id IS NOT NULL;
