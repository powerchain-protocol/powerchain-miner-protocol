import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="brand" href="#" aria-label="PowerChain home">
          <BrandMark size={34} />
          <span>
            <strong>PowerChain</strong>
            <small>Renewable Miner OS</small>
          </span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#proof">Proof of Energy</a>
          <a href="#architecture">Architecture</a>
          <a href="#agent-compute">Agent Compute</a>
          <a href="#mobile">Mobile</a>
          <a href="#security">Security</a>
        </nav>

        <div className="site-header__actions">
          <a className="button button--ghost" href="https://docs.powerchain.energy">
            Docs
          </a>
          <a className="button button--primary" href="https://dashboard.powerchain.energy">
            Open console
          </a>
        </div>
      </div>
    </header>
  );
}
