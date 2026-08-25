const capabilities = [
  {
    label: "WALLET",
    title: "Wallet-funded compute",
    text: "Fund compute credit from the same agent wallet used for identity and commerce instead of maintaining a separate provider billing account.",
  },
  {
    label: "ENDPOINT",
    title: "OpenAI-compatible access",
    text: "Use Chat Completions or Responses-style requests against the PowerChain compute endpoint with one agent-scoped credential.",
  },
  {
    label: "POLICY",
    title: "Conservative auto-top up",
    text: "Define a low-balance threshold, top-up amount, preferred funding asset and a hard daily autonomous top-up ceiling.",
  },
  {
    label: "ACCOUNTING",
    title: "Usage-bound billing",
    text: "Every model request is preauthorized against available compute credit and settled from returned token usage into an append-only ledger.",
  },
];

export function AgentComputeSection() {
  return (
    <section className="section agent-compute-section" id="agent-compute">
      <div className="container agent-compute-grid">
        <div className="section-heading">
          <span className="eyebrow">AGENT COMPUTE</span>
          <h2>Infrastructure an agent can actually pay for.</h2>
          <p>
            Identity, wallet funding, endpoint access and compute usage stay
            attached to the same AgentOS identity.
          </p>

          <div className="agent-compute-endpoint">
            <span>BASE URL</span>
            <code>https://compute.powerchain.energy/v1</code>
          </div>
        </div>

        <div className="agent-compute-card">
          <div className="agent-compute-card__header">
            <div>
              <span>Grid Researcher</span>
              <strong>Compute account</strong>
            </div>
            <b>ACTIVE</b>
          </div>

          <div className="agent-compute-balance">
            <span>AVAILABLE CREDIT</span>
            <strong>128.42</strong>
            <small>34.60 reserved · auto-top up enabled</small>
          </div>

          <div className="agent-compute-flow">
            <span><i>1</i><b>API request</b></span>
            <span><i>2</i><b>Preauthorize</b></span>
            <span><i>3</i><b>Compute</b></span>
            <span><i>4</i><b>Settle usage</b></span>
          </div>

          <div className="agent-compute-policy">
            <span>
              <small>Funding</small>
              <strong>Solana · USDC</strong>
            </span>
            <span>
              <small>Low balance</small>
              <strong>25.00</strong>
            </span>
            <span>
              <small>Top-up</small>
              <strong>100.00</strong>
            </span>
            <span>
              <small>Daily cap</small>
              <strong>300.00</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="container agent-compute-features">
        {capabilities.map((capability) => (
          <article key={capability.title}>
            <span>{capability.label}</span>
            <h3>{capability.title}</h3>
            <p>{capability.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
