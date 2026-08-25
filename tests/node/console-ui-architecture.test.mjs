import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const required = [
  "apps/console/config/app.ts",
  "apps/console/config/navigation.ts",
  "apps/console/constants/routes.ts",
  "apps/console/env/client.ts",
  "apps/console/env/server.ts",
  "apps/console/context/app-context.tsx",
  "apps/console/context/wallet-context.tsx",
  "apps/console/events.ts",
  "apps/console/types/events.ts",
  "apps/console/components/common/desktop-sidebar.tsx",
  "apps/console/components/common/desktop-header.tsx",
  "apps/console/components/modals/pair-node-modal.tsx",
  "apps/console/components/modals/proof-details-modal.tsx",
  "apps/console/components/modals/wallet-connect-modal.tsx",
  "apps/console/components/ui/button.tsx",
  "apps/console/components/ui/dialog.tsx",
  "apps/console/styles/themes.css",
  "apps/console/styles/wallet-connect.css",
  "apps/console/styles/desktop.css",
  "apps/console/components.json",
  "apps/console/postcss.config.mjs",
  "apps/console/vercel.json",
];

test("desktop console has canonical UI architecture", async () => {
  for (const path of required) {
    await access(path);
  }
});

test("console pins current compatible Tailwind, Radix, shadcn and React Icons", async () => {
  const pkg = JSON.parse(
    await readFile("apps/console/package.json", "utf8"),
  );

  assert.equal(pkg.dependencies.next, "16.3.2");
  assert.equal(pkg.dependencies["@radix-ui/react-dialog"], "1.1.23");
  assert.equal(pkg.dependencies["@radix-ui/react-dropdown-menu"], "2.1.24");
  assert.equal(pkg.dependencies["@radix-ui/react-tooltip"], "1.2.16");
  assert.equal(pkg.dependencies["react-icons"], "5.7.0");
  assert.equal(pkg.dependencies["tailwind-merge"], "3.6.0");
  assert.equal(pkg.devDependencies.tailwindcss, "4.3.3");
  assert.equal(pkg.devDependencies["@tailwindcss/postcss"], "4.3.3");
  assert.equal(pkg.devDependencies.shadcn, "4.19.0");
});

test("Next config enables stable typed routes and production security headers", async () => {
  const source = await readFile(
    "apps/console/next.config.ts",
    "utf8",
  );

  assert.match(source, /typedRoutes:\s*true/);
  assert.match(source, /Strict-Transport-Security/);
  assert.match(source, /Cross-Origin-Resource-Policy/);
  assert.match(source, /image\/avif/);
  assert.doesNotMatch(source, /experimental:\s*\{[\s\S]*optimizePackageImports/);
});

test("typed events are consumed by wallet and dashboard workflows", async () => {
  const events = await readFile("apps/console/events.ts", "utf8");
  const wallet = await readFile(
    "apps/console/context/wallet-context.tsx",
    "utf8",
  );
  const dashboard = await readFile(
    "apps/console/components/dashboard.tsx",
    "utf8",
  );

  assert.match(events, /TypedEventBus/);
  assert.match(wallet, /appEvents\.emit\("wallet:connected"/);
  assert.match(dashboard, /appEvents\.emit\("proof:selected"/);
  assert.match(dashboard, /PairNodeModal/);
  assert.match(dashboard, /ProofDetailsModal/);
  assert.doesNotMatch(dashboard, /modal-backdrop/);
});

test("proxy centralizes session and protected-route constants", async () => {
  const source = await readFile("apps/console/proxy.ts", "utf8");
  assert.match(source, /PROTECTED_ROUTES/);
  assert.match(source, /SESSION_COOKIE_NAME/);
  assert.match(source, /safeReturnTo/);
});

test("theme keeps PowerChain light gray, dark green and black system", async () => {
  const source = await readFile(
    "apps/console/styles/themes.css",
    "utf8",
  );
  for (const value of ["#f5f7f5", "#ffffff", "#0d1510", "#0b3d25"]) {
    assert.ok(source.toLowerCase().includes(value), value);
  }
  assert.doesNotMatch(source, /purple|violet|magenta|neon/i);
});
