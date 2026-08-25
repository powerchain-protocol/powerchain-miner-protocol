import Link from "next/link";
import type { ReactNode } from "react";

export function ConsoleShell({
  title,
  eyebrow,
  children,
  isSuperadmin = false,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  isSuperadmin?: boolean;
}) {
  return (
    <main className="console-shell">
      <aside className="console-sidebar">
        <Link href="/" className="console-brand"><span>P</span><div><strong>PowerChain</strong><small>Miner OS</small></div></Link>
        <nav>
          <Link href="/superadmin">Platform</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/compute">Agent Compute</Link>
          <Link href="/proofs">Proofs</Link>
          <Link href="/audit">Audit</Link>
          <Link href="/roles">Roles & Access</Link>
          <Link href="/">Node Console</Link>
        </nav>
        <div className="console-role">{isSuperadmin ? "SUPERADMIN" : "CLIENT USER"}</div>
        <form action="/api/session/logout" method="post"><button className="console-logout">Sign out</button></form>
      </aside>
      <section className="console-main">
        <header className="console-header">
          <div><span>{eyebrow}</span><h1>{title}</h1></div>
          <div className="console-network"><i /> SOLANA · DEVNET</div>
        </header>
        <div className="console-content">{children}</div>
      </section>
    </main>
  );
}
