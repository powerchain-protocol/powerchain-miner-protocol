import { MetricCard } from "../MetricCard";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="eyebrow">RENEWABLE USEFUL-WORK INFRASTRUCTURE</span>
          <h1>
            Turn renewable energy evidence into
            <em> verifiable network rewards.</em>
          </h1>
          <p>
            Renewable Miner OS runs on Raspberry Pi and Linux nodes, signs
            Proof-of-Energy evidence locally, verifies it through independent
            policy, and settles approved MINER rewards on Solana.
          </p>

          <div className="hero__actions">
            <a className="button button--primary button--large" href="https://dashboard.powerchain.energy">
              Launch console
            </a>
            <a className="button button--outline button--large" href="#architecture">
              Explore architecture
            </a>
          </div>

          <div className="hero__trust">
            <span>Non-custodial node identity</span>
            <span>Token-2022 settlement</span>
            <span>Append-only audit</span>
          </div>
        </div>

        <div className="hero-console" aria-label="Product preview">
          <div className="hero-console__top">
            <span>Network operations</span>
            <b>LIVE · DEVNET</b>
          </div>

          <div className="hero-console__metrics">
            <MetricCard label="Miners online" value="1,248" detail="+3.8% / 7d" />
            <MetricCard label="Network power" value="12.84 MW" detail="+4.1% / 7d" />
            <MetricCard label="Energy / 30d" value="2,153 MWh" detail="+8.2%" />
          </div>

          <div className="hero-console__panel">
            <div>
              <span className="eyebrow">PROOF OF ENERGY</span>
              <h3>Evidence pipeline</h3>
            </div>
            <div className="proof-mini">
              {["Captured", "Validated", "Attested", "Verified", "Settled"].map(
                (item, index) => (
                  <span key={item} className="proof-mini__step">
                    <i>{index + 1}</i>
                    <b>{item}</b>
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="hero-console__lower">
            <div className="chart-card">
              <span>Energy generation</span>
              <svg viewBox="0 0 400 120" role="img" aria-label="Energy generation trend">
                <path
                  d="M0 95 C35 90 42 60 76 70 S125 80 150 43 S205 50 230 30 S275 62 305 42 S350 18 400 34"
                  fill="none"
                  stroke="#176B3A"
                  strokeWidth="4"
                />
              </svg>
            </div>
            <div className="balance-card">
              <span>Available MINER</span>
              <strong>42,356.78</strong>
              <span className="preview-action">Claim rewards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
