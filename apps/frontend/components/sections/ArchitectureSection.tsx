const layers = [
  {
    label: "PHYSICAL",
    title: "Meter / EMS / inverter",
    detail: "Measurement truth and source identity",
  },
  {
    label: "EDGE",
    title: "Renewable Miner node",
    detail: "Sampling, signing, durable queue, Linux operations",
  },
  {
    label: "CONTROL",
    title: "Backend + evidence quorum",
    detail: "RBAC, policy, rewards, audit and reconciliation",
  },
  {
    label: "EXECUTION",
    title: "Solana Miner program",
    detail: "Device state, claim receipts and Token-2022 settlement",
  },
];

export function ArchitectureSection() {
  return (
    <section className="section" id="architecture">
      <div className="container architecture">
        <div className="section-heading">
          <span className="eyebrow">ARCHITECTURE</span>
          <h2>Every authority has one job.</h2>
          <p>
            The system is designed so no single node, backend route or wallet
            can silently convert telemetry into spendable rewards.
          </p>
        </div>

        <div className="architecture-stack">
          {layers.map((layer, index) => (
            <article key={layer.label}>
              <span>{layer.label}</span>
              <div>
                <strong>{layer.title}</strong>
                <small>{layer.detail}</small>
              </div>
              <b>{String(index + 1).padStart(2, "0")}</b>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
