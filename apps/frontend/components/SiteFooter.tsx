import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="brand brand--footer">
          <BrandMark size={36} />
          <span>
            <strong>PowerChain</strong>
            <small>Renewable Miner OS</small>
          </span>
        </div>

        <p>
          Physical energy provides truth. Evidence verifies it. Humans approve
          economics. Wallets authorize. Solana settles.
        </p>

        <div className="site-footer__links">
          <a href="https://docs.powerchain.energy">Documentation</a>
          <a href="https://github.com/powerchain-protocol">GitHub</a>
          <a href="https://x.com/powerchain_ai">X</a>
        </div>
      </div>
    </footer>
  );
}
