const steps = [
  ["01", "Measure", "Meter or EMS provides physical renewable-energy readings."],
  ["02", "Sign", "The node signs canonical Proof-of-Energy evidence with its Ed25519 identity."],
  ["03", "Attest", "Registered evidence verifiers sign economically relevant decisions."],
  ["04", "Reward", "Verified Wh enters deterministic policy and append-only reward accounting."],
  ["05", "Settle", "The reward owner authorizes the Solana claim and the API reconciles it."],
];

export function ProofFlowSection() {
  return (
    <section className="section section--muted" id="proof">
      <div className="container">
        <div className="section-heading section-heading--row">
          <div>
            <span className="eyebrow">PROOF OF ENERGY</span>
            <h2>A transparent evidence chain.</h2>
          </div>
          <p>
            Measurement, verification, economics, user authorization and
            blockchain execution remain separate trust domains.
          </p>
        </div>

        <div className="flow-grid">
          {steps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
