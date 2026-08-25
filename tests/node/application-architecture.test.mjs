import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const exists = async (path) => {
  await stat(path);
  return true;
};

test("console includes requested hooks/lib/data/type architecture", async () => {
  for (const path of [
    "apps/console/hooks/use-media-queries.ts",
    "apps/console/hooks/use-ai.ts",
    "apps/console/hooks/use-miner.ts",
    "apps/console/hooks/use-users.ts",
    "apps/console/hooks/use-embedded-wallets.ts",
    "apps/console/hooks/use-portfolio.ts",
    "apps/console/hooks/use-subscriptions.ts",
    "apps/console/lib/safe-actions.ts",
    "apps/console/lib/rate-limiter.ts",
    "apps/console/lib/transactions.ts",
    "apps/console/lib/solana.ts",
    "apps/console/lib/sui.ts",
    "apps/console/lib/birdeye.ts",
    "apps/console/lib/pyth.ts",
    "apps/console/lib/embedded-wallets.ts",
    "apps/console/lib/mail/messages.ts",
    "apps/console/data/fetch-data.ts",
    "apps/console/data/fetch-prices.ts",
    "apps/console/data/balances.ts",
    "apps/console/data/transactions/index.ts",
    "apps/console/data/users/id.ts",
    "apps/console/data/users/slug.ts",
    "apps/console/data/users/auth.ts",
    "apps/console/types/actions/index.ts",
    "apps/console/types/errors.ts",
    "apps/console/types/portfolio.ts",
    "apps/console/types/mail.ts",
    "apps/console/types/subscribe.ts",
    "apps/console/types/assets.ts",
    "apps/console/types/accounts.ts",
    "apps/console/components/common/login-form.tsx",
    "apps/console/components/common/alarms.tsx",
    "apps/console/components/common/informations.tsx",
  ]) {
    assert.equal(await exists(path), true, path);
  }
});

test("requested current direct dependency baseline is pinned", async () => {
  const consolePkg = JSON.parse(
    await readFile("apps/console/package.json", "utf8"),
  );
  const backendPkg = JSON.parse(
    await readFile("apps/backend/package.json", "utf8"),
  );

  assert.equal(consolePkg.dependencies.axios, "1.19.0");
  assert.equal(consolePkg.dependencies.bs58, "6.0.0");
  assert.equal(consolePkg.dependencies.lodash, "4.18.1");
  assert.equal(consolePkg.dependencies.zod, "4.4.3");
  assert.equal(backendPkg.dependencies.ws, "8.21.3");
});

test("market data credentials remain server-only", async () => {
  const env = await readFile("apps/console/env/server.ts", "utf8");
  const clientEnv = await readFile("apps/console/env/client.ts", "utf8");
  assert.match(env, /BIRDEYE_API_KEY/);
  assert.match(env, /PYTH_API_KEY/);
  assert.doesNotMatch(clientEnv, /BIRDEYE_API_KEY|PYTH_API_KEY/);
});

test("login page consumes shared common login form", async () => {
  const page = await readFile("apps/console/app/login/page.tsx", "utf8");
  assert.match(page, /LoginForm/);
  assert.doesNotMatch(page, /type="password"/);
});
