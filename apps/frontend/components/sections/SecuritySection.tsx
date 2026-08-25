const controls = [
  "Device keys never become treasury authority.",
  "Evidence verifier identities are registered and signed.",
  "Reward claims require independent Finance approval.",
  "The reward-owner wallet signs the final claim.",
  "ClaimReceipt prevents replay.",
  "Audit and reward ledger history are append-only.",
];

export function SecuritySection() {
  return (
    <section className="section" id="security">
      <div className="container security-grid">
        <div className="section-heading">
          <span className="eyebrow">SECURITY MODEL</span>
          <h2>No invisible authority.</h2>
          <p>
            PowerChain keeps physical truth, evidence trust, economic policy,
            user authorization and blockchain execution independently visible.
          </p>
          <a className="button button--outline" href="https://docs.powerchain.energy">
            Read security docs
          </a>
        </div>

        <div className="security-list">
          {controls.map((control, index) => (
            <article key={control}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{control}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
