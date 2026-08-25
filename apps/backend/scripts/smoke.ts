import { pool } from "../src/db.js";

async function expectOne(sql: string, label: string) {
  const result = await pool.query(sql);
  if (!result.rows[0]) {
    throw new Error(`DB smoke failed: ${label}`);
  }
}

try {
  const migrations = await pool.query(
    `SELECT count(*)::int AS count FROM schema_migrations`,
  );
  if (Number(migrations.rows[0]?.count ?? 0) < 11) {
    throw new Error("DB smoke failed: expected at least eleven migrations.");
  }

  await expectOne(
    `SELECT 1 FROM pg_trigger
      WHERE tgname='trg_reward_ledger_immutable'
        AND NOT tgisinternal`,
    "reward ledger immutable trigger",
  );

  await expectOne(
    `SELECT 1 FROM pg_trigger
      WHERE tgname='trg_audit_logs_immutable'
        AND NOT tgisinternal`,
    "audit immutable trigger",
  );

  await expectOne(
    `SELECT 1 FROM pg_trigger
      WHERE tgname='trg_audit_checkpoints_immutable'
        AND NOT tgisinternal`,
    "audit checkpoint immutable trigger",
  );

  await expectOne(
    `SELECT 1 FROM pg_trigger
      WHERE tgname='trg_compute_ledger_immutable'
        AND NOT tgisinternal`,
    "compute ledger immutable trigger",
  );

  await expectOne(
    `SELECT 1 FROM pg_constraint
      WHERE conname='proofs_settlement_lease_consistent'`,
    "proof settlement lease consistency",
  );

  await expectOne(
    `SELECT 1 FROM pg_constraint
      WHERE conname='reward_claim_quorum_fields'`,
    "reward claim approval quorum constraint",
  );

  await expectOne(
    `SELECT 1 FROM pg_constraint
      WHERE conname='compute_models_executable_route_complete'`,
    "compute executable route constraint",
  );

  await expectOne(
    `SELECT 1 FROM pg_constraint
      WHERE conname='reward_policies_no_active_overlap'`,
    "reward policy overlap constraint",
  );

  await expectOne(
    `SELECT 1 FROM pg_constraint
      WHERE conname='reward_epochs_no_active_overlap'`,
    "reward epoch overlap constraint",
  );

  await pool.query(
    `SELECT * FROM append_audit_log(
       NULL,
       'ci@powerchain.invalid',
       'ci.smoke',
       'ci',
       NULL,
       NULL,
       '{"source":"db-smoke"}'::jsonb
     )`,
  );

  const audit = await pool.query(
    `SELECT * FROM verify_audit_chain('platform')`,
  );
  if (!audit.rows[0]?.valid) {
    throw new Error(
      `DB smoke failed: audit chain invalid at ${audit.rows[0]?.first_invalid_audit_id}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        migrations: Number(migrations.rows[0].count),
        auditRows: Number(audit.rows[0].checked_rows),
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
