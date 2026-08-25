-- Canonical v1.0.0 internal schema evolution.
-- Role-distinct reward claim approvals and verifier-class independence controls.

CREATE TABLE IF NOT EXISTS reward_claim_approval_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  high_value_threshold_base_units numeric(30,0)
    CHECK (high_value_threshold_base_units IS NULL OR high_value_threshold_base_units > 0),
  normal_required_roles text[] NOT NULL DEFAULT ARRAY['FINANCE']::text[],
  high_value_required_roles text[] NOT NULL DEFAULT ARRAY['FINANCE','CLIENT_ADMIN']::text[],
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(normal_required_roles) BETWEEN 1 AND 3),
  CHECK (cardinality(high_value_required_roles) BETWEEN 1 AND 3),
  CHECK (normal_required_roles <@ ARRAY['FINANCE','CLIENT_ADMIN']::text[]),
  CHECK (high_value_required_roles <@ ARRAY['FINANCE','CLIENT_ADMIN']::text[])
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_reward_claim_approval_policy_active
  ON reward_claim_approval_policies(client_id)
  WHERE active=true;

ALTER TABLE reward_claims
  ADD COLUMN IF NOT EXISTS approval_policy_id uuid REFERENCES reward_claim_approval_policies(id),
  ADD COLUMN IF NOT EXISTS required_approval_roles text[] NOT NULL DEFAULT ARRAY['FINANCE']::text[],
  ADD COLUMN IF NOT EXISTS required_approvals integer NOT NULL DEFAULT 1
    CHECK (required_approvals BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS approval_count integer NOT NULL DEFAULT 0
    CHECK (approval_count BETWEEN 0 AND 3);

UPDATE reward_claims
   SET approval_count=1
 WHERE approved_by IS NOT NULL
   AND status IN ('APPROVED','SUBMITTED','CONFIRMED')
   AND approval_count=0;

CREATE TABLE IF NOT EXISTS reward_claim_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES reward_claims(id) ON DELETE CASCADE,
  approver_user_id uuid NOT NULL REFERENCES users(id),
  approver_role text NOT NULL CHECK (approver_role IN ('FINANCE','CLIENT_ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(claim_id,approver_user_id),
  UNIQUE(claim_id,approver_role)
);

CREATE INDEX IF NOT EXISTS idx_reward_claim_approvals_claim
  ON reward_claim_approvals(claim_id,created_at);

ALTER TABLE reward_claims
  DROP CONSTRAINT IF EXISTS reward_claim_quorum_fields;

ALTER TABLE reward_claims
  ADD CONSTRAINT reward_claim_quorum_fields CHECK (
    status NOT IN ('APPROVED','SUBMITTED','CONFIRMED')
    OR approval_count >= required_approvals
  );

ALTER TABLE evidence_verifiers
  ADD COLUMN IF NOT EXISTS verifier_class text NOT NULL DEFAULT 'RULE'
  CHECK (verifier_class IN (
    'RULE','EMS','REVENUE_METER','UTILITY','GRID_OPERATOR',
    'GATEWAY','SIGNED_WEBHOOK','MANUAL_REVIEW'
  ));

CREATE TABLE IF NOT EXISTS verification_policy_class_requirements (
  policy_id uuid NOT NULL REFERENCES verification_policies(id) ON DELETE CASCADE,
  verifier_class text NOT NULL CHECK (verifier_class IN (
    'RULE','EMS','REVENUE_METER','UTILITY','GRID_OPERATOR',
    'GATEWAY','SIGNED_WEBHOOK','MANUAL_REVIEW'
  )),
  min_count integer NOT NULL CHECK (min_count BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(policy_id,verifier_class)
);

CREATE INDEX IF NOT EXISTS idx_verification_policy_class_requirements
  ON verification_policy_class_requirements(policy_id,verifier_class);
