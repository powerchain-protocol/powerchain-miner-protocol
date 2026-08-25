import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

export default async function RolesPage() {
  let data: { permissions: Record<string, readonly string[]> };
  try {
    data = await consoleApi("/api/v1/roles");
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  return (
    <ConsoleShell title="Roles & Access" eyebrow="RBAC">
      <section className="role-grid">
        {Object.entries(data.permissions).map(([role, permissions]) => (
          <article className="role-card" key={role}>
            <div className="role-card-head"><strong>{role}</strong><span>{permissions.length} permissions</span></div>
            <ul>{permissions.map((permission) => <li key={permission}>{permission}</li>)}</ul>
          </article>
        ))}
      </section>
      <section className="console-panel">
        <span className="section-label">SEPARATION OF DUTIES</span>
        <h2>Reward payout control</h2>
        <div className="duty-flow">
          <span>OPERATOR<small>node operations</small></span><i>→</i>
          <span>VERIFIER<small>proof evidence</small></span><i>→</i>
          <span>FINANCE<small>claim approval</small></span><i>→</i>
          <span>SUPERADMIN<small>chain settlement</small></span>
        </div>
      </section>
    </ConsoleShell>
  );
}
