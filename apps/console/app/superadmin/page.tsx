import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

type Summary = {
  clients: { count: number };
  users: { count: number };
  devices: { total: number; online: number };
  proofs: { count: number; energy_wh: string };
  claims: { pending: number };
  rewards: { net_reward_base_units: string };
  network: string;
  minerMint: string | null;
  programId: string | null;
};

export default async function SuperAdminPage() {
  let summary: Summary;
  try {
    summary = await consoleApi<Summary>("/api/v1/platform/summary");
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    if ((error as { status?: number }).status === 403) redirect("/clients");
    throw error;
  }

  const token = Number(summary.rewards.net_reward_base_units ?? 0) / 1_000_000_000;

  return (
    <ConsoleShell title="Platform Control" eyebrow="SUPERADMIN" isSuperadmin>
      <section className="console-metrics">
        <article><span>Active clients</span><strong>{summary.clients.count}</strong><small>Organizations</small></article>
        <article><span>Users</span><strong>{summary.users.count}</strong><small>Platform identities</small></article>
        <article><span>Nodes online</span><strong>{summary.devices.online}/{summary.devices.total}</strong><small>Fleet health</small></article>
        <article><span>Pending claims</span><strong>{summary.claims.pending}</strong><small>Needs action</small></article>
        <article><span>Verified energy</span><strong>{(Number(summary.proofs.energy_wh)/1000).toFixed(2)} kWh</strong><small>{summary.proofs.count} proofs</small></article>
        <article><span>Reward ledger</span><strong>{token.toFixed(3)} MINER</strong><small>Net balance effect</small></article>
      </section>

      <section className="console-grid">
        <article className="console-panel">
          <span className="section-label">NETWORK</span>
          <h2>Settlement boundary</h2>
          <dl className="key-values">
            <div><dt>Cluster</dt><dd>{summary.network}</dd></div>
            <div><dt>MINER mint</dt><dd className="mono">{summary.minerMint ?? "Not configured"}</dd></div>
            <div><dt>Program</dt><dd className="mono">{summary.programId ?? "Not configured"}</dd></div>
          </dl>
        </article>
        <article className="console-panel">
          <span className="section-label">CONTROL PRINCIPLE</span>
          <h2>Separated authority</h2>
          <p>Operators manage devices. Verifiers validate evidence. Finance approves claims. SuperAdmin governs clients and platform controls. Treasury settlement stays separate from Raspberry Pi identities.</p>
        </article>
      </section>
    </ConsoleShell>
  );
}
