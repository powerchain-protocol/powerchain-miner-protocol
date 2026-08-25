const features = [
  {
    kicker: "COMPUTE",
    title: "Agent Compute",
    text: "Wallet-funded endpoint access, scoped API keys, usage preauthorization and bounded auto-top-up policy for autonomous runtimes.",
  },
  {
    kicker: "NODE",
    title: "Raspberry Pi + Linux",
    text: "Signed local identity, durable SQLite queue, offline-first proof delivery, health telemetry and controlled source rotation.",
  },
  {
    kicker: "EVIDENCE",
    title: "Proof of Energy",
    text: "Integer Wh accounting, source continuity, verifier quorum, quality policy and deterministic digest chains.",
  },
  {
    kicker: "REWARDS",
    title: "MINER accounting",
    text: "BigInt reward logic, non-overlapping policy windows, append-only ledger and wallet-bound claim ownership.",
  },
  {
    kicker: "SOLANA",
    title: "Wallet-authorized settlement",
    text: "Token-2022 program treasury, short-lived claim authorization, one-time ClaimReceipt PDA and reconciled settlement.",
  },
  {
    kicker: "CONTROL",
    title: "Role separation",
    text: "SuperAdmin, Client Admin, Finance, Operator, Verifier and Viewer permissions with requester/approver separation.",
  },
  {
    kicker: "AUDIT",
    title: "Tamper-evident history",
    text: "Hash-chained audit events, immutable checkpoints, deployment manifests and transaction reconciliation provenance.",
  },
];

export function FeatureGrid() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">CORE PLATFORM</span>
          <h2>Useful work, not artificial mining.</h2>
          <p>
            The node earns from independently verified renewable-energy work,
            not proof-of-work hashing.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span>{feature.kicker}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
