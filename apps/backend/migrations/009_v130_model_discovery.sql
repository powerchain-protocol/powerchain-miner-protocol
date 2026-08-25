-- PowerChain Agent Compute v1.3
-- Separates discoverable model metadata from executable billing/routing configuration.

ALTER TABLE compute_models
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS context_length integer,
  ADD COLUMN IF NOT EXISTS listed boolean NOT NULL DEFAULT true;

UPDATE compute_models
   SET display_name = COALESCE(NULLIF(display_name,''), public_model)
 WHERE display_name IS NULL OR display_name='';

-- Existing v1.2 routes remain executable. New catalog-only records may be
-- discoverable before an operator supplies upstream routing and billing rates.
ALTER TABLE compute_models
  ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE compute_models
  ALTER COLUMN upstream_model DROP NOT NULL,
  ALTER COLUMN input_rate_microunits_per_1k DROP NOT NULL,
  ALTER COLUMN output_rate_microunits_per_1k DROP NOT NULL;

ALTER TABLE compute_models
  ALTER COLUMN enabled SET DEFAULT false;

ALTER TABLE compute_models
  ADD CONSTRAINT compute_models_context_length_valid
  CHECK (
    context_length IS NULL
    OR context_length BETWEEN 1 AND 4000000
  );

ALTER TABLE compute_models
  ADD CONSTRAINT compute_models_executable_route_complete
  CHECK (
    enabled=false
    OR (
      upstream_model IS NOT NULL
      AND input_rate_microunits_per_1k IS NOT NULL
      AND output_rate_microunits_per_1k IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_compute_models_listed
  ON compute_models(listed,public_model)
  WHERE listed=true;
