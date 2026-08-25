import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

function requiredGroup(
  names: string[],
) {
  const values = names.map(
    (name) => process.env[name]?.trim() ?? "",
  );
  const configured = values.some(Boolean);

  if (!configured) return null;
  if (values.some((value) => !value)) {
    throw new Error(
      `Partial Agent Compute bootstrap configuration: ${names.join(", ")}`,
    );
  }

  return Object.fromEntries(
    names.map((name, index) => [
      name,
      values[index],
    ]),
  );
}

const model = requiredGroup([
  "COMPUTE_DEFAULT_PUBLIC_MODEL",
  "COMPUTE_DEFAULT_UPSTREAM_MODEL",
  "COMPUTE_DEFAULT_INPUT_RATE_MICROUNITS_PER_1K",
  "COMPUTE_DEFAULT_OUTPUT_RATE_MICROUNITS_PER_1K",
  "COMPUTE_DEFAULT_MAX_OUTPUT_TOKENS",
  "COMPUTE_DEFAULT_CONTEXT_LENGTH",
]);

const funding = requiredGroup([
  "COMPUTE_SOLANA_FUNDING_SYMBOL",
  "COMPUTE_SOLANA_FUNDING_MINT",
  "COMPUTE_SOLANA_TREASURY_TOKEN_ACCOUNT",
  "COMPUTE_SOLANA_ASSET_DECIMALS",
  "COMPUTE_SOLANA_CREDIT_MICROUNITS_PER_BASE_UNIT",
]);

try {
  const catalog = JSON.parse(
    await readFile(
      "config/compute-models.production.json",
      "utf8",
    ),
  ) as {
    models: Array<{
      id: string;
      name: string;
      description: string;
      contextLength: number;
    }>;
  };

  for (const item of catalog.models) {
    await pool.query(
      `INSERT INTO compute_models
        (
          public_model,
          display_name,
          description,
          context_length,
          upstream_model,
          listed,
          enabled,
          input_rate_microunits_per_1k,
          output_rate_microunits_per_1k,
          max_output_tokens
        )
       VALUES ($1,$2,$3,$4,NULL,true,false,NULL,NULL,8192)
       ON CONFLICT (public_model)
       DO UPDATE SET
         display_name=EXCLUDED.display_name,
         description=EXCLUDED.description,
         context_length=EXCLUDED.context_length,
         listed=true,
         updated_at=now()`,
      [
        item.id,
        item.name,
        item.description,
        item.contextLength,
      ],
    );
  }

  console.log(
    `[compute:seed] catalog ${catalog.models.length} models`,
  );

  if (model) {
    const cached =
      process.env
        .COMPUTE_DEFAULT_CACHED_INPUT_RATE_MICROUNITS_PER_1K
        ?.trim() || null;

    await pool.query(
      `INSERT INTO compute_models
        (
          public_model,
          display_name,
          description,
          context_length,
          upstream_model,
          input_rate_microunits_per_1k,
          cached_input_rate_microunits_per_1k,
          output_rate_microunits_per_1k,
          max_output_tokens
        )
       VALUES (
         $1,
         COALESCE(
           (SELECT display_name FROM compute_models WHERE public_model=$1),
           $1
         ),
         COALESCE(
           (SELECT description FROM compute_models WHERE public_model=$1),
           ''
         ),
         COALESCE(
           (SELECT context_length FROM compute_models WHERE public_model=$1),
           $7
         ),
         $2,$3,$4,$5,$6
       )
       ON CONFLICT (public_model)
       DO UPDATE SET
         upstream_model=EXCLUDED.upstream_model,
         input_rate_microunits_per_1k=
           EXCLUDED.input_rate_microunits_per_1k,
         cached_input_rate_microunits_per_1k=
           EXCLUDED.cached_input_rate_microunits_per_1k,
         output_rate_microunits_per_1k=
           EXCLUDED.output_rate_microunits_per_1k,
         max_output_tokens=
           EXCLUDED.max_output_tokens,
         enabled=true,
         updated_at=now()`,
      [
        model.COMPUTE_DEFAULT_PUBLIC_MODEL,
        model.COMPUTE_DEFAULT_UPSTREAM_MODEL,
        model
          .COMPUTE_DEFAULT_INPUT_RATE_MICROUNITS_PER_1K,
        cached,
        model
          .COMPUTE_DEFAULT_OUTPUT_RATE_MICROUNITS_PER_1K,
        Number(
          model.COMPUTE_DEFAULT_MAX_OUTPUT_TOKENS,
        ),
        Number(
          model.COMPUTE_DEFAULT_CONTEXT_LENGTH,
        ),
      ],
    );

    console.log(
      `[compute:seed] model ${model.COMPUTE_DEFAULT_PUBLIC_MODEL}`,
    );
  } else {
    console.log(
      "[compute:seed] model configuration not supplied; skipped",
    );
  }

  if (funding) {
    await pool.query(
      `INSERT INTO compute_funding_assets
        (
          chain,
          symbol,
          asset_identifier,
          treasury_destination,
          decimals,
          credit_microunits_per_base_unit
        )
       VALUES ('solana',$1,$2,$3,$4,$5)
       ON CONFLICT (chain,symbol)
       DO UPDATE SET
         asset_identifier=EXCLUDED.asset_identifier,
         treasury_destination=
           EXCLUDED.treasury_destination,
         decimals=EXCLUDED.decimals,
         credit_microunits_per_base_unit=
           EXCLUDED.credit_microunits_per_base_unit,
         enabled=true,
         updated_at=now()`,
      [
        funding.COMPUTE_SOLANA_FUNDING_SYMBOL.toUpperCase(),
        funding.COMPUTE_SOLANA_FUNDING_MINT,
        funding.COMPUTE_SOLANA_TREASURY_TOKEN_ACCOUNT,
        Number(
          funding.COMPUTE_SOLANA_ASSET_DECIMALS,
        ),
        funding
          .COMPUTE_SOLANA_CREDIT_MICROUNITS_PER_BASE_UNIT,
      ],
    );

    console.log(
      `[compute:seed] funding solana:${funding.COMPUTE_SOLANA_FUNDING_SYMBOL}`,
    );
  } else {
    console.log(
      "[compute:seed] funding configuration not supplied; skipped",
    );
  }
} finally {
  await pool.end();
}
