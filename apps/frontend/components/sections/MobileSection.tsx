export function MobileSection() {
  return (
    <section className="section section--dark" id="mobile">
      <div className="container mobile-section">
        <div className="mobile-copy">
          <span className="eyebrow eyebrow--light">EXPO MOBILE</span>
          <h2>Operations in your pocket.</h2>
          <p>
            View miner health, Proof-of-Energy status, rewards and alerts from
            the companion Expo application without moving signing authority
            into the device-monitoring app.
          </p>
          <div className="mobile-copy__points">
            <span>iOS + Android</span>
            <span>Expo SDK 57</span>
            <span>Light-first design</span>
          </div>
        </div>

        <div className="phone-frame" aria-label="Mobile app preview">
          <div className="phone-frame__header">
            <strong>PowerChain</strong>
            <span>●</span>
          </div>
          <div className="phone-frame__content">
            <span className="eyebrow">OVERVIEW</span>
            <h3>Renewable network</h3>
            <div className="phone-metrics">
              <article><small>Miners</small><strong>1,248</strong></article>
              <article><small>Power</small><strong>12.84 MW</strong></article>
              <article><small>Energy</small><strong>2,153 MWh</strong></article>
              <article><small>MINER</small><strong>42,356</strong></article>
            </div>
            <div className="phone-status">
              <span>Network</span>
              <strong>Healthy</strong>
            </div>
            <span className="preview-action preview-action--wide">
              Open rewards
            </span>
          </div>
          <div className="phone-frame__tabs">
            <b>Home</b><span>Miners</span><span>Rewards</span><span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
