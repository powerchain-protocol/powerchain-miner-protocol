type DepinFeature = {
  title: string;
  text: string;
  icon:
    | "wallet"
    | "solar"
    | "device"
    | "analytics"
    | "market"
    | "p2p";
};

const features: DepinFeature[] = [
  {
    icon: "wallet",
    title: "Solana Wallet Integration",
    text: "Connect a Solana-compatible wallet to authorize energy transactions, rewards and settlement without giving the platform custody of private keys.",
  },
  {
    icon: "solar",
    title: "Solar Panel Monitoring",
    text: "Monitor renewable generation and energy use from explicit smart-meter, inverter and EMS integrations with signed evidence provenance.",
  },
  {
    icon: "device",
    title: "IoT Device Integration",
    text: "Connect Raspberry Pi nodes, smart meters, ESP32 hardware and LoRaWAN/Helium gateways under device-specific identities.",
  },
  {
    icon: "analytics",
    title: "Energy Analytics",
    text: "Visualize production, consumption, verified energy, quality, settlement state and economic outcomes over time.",
  },
  {
    icon: "market",
    title: "Energy Marketplace",
    text: "Create reviewable local energy listings and reservations while keeping physical delivery evidence separate from financial settlement.",
  },
  {
    icon: "p2p",
    title: "Peer-to-Peer Trading",
    text: "Prepare direct community energy trades with reservation, delivery, reconciliation and wallet-authorization controls.",
  },
];

function DepinIcon({
  icon,
}: {
  icon: DepinFeature["icon"];
}) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (icon === "wallet") {
    return (
      <svg {...common}>
        <path d="M4 6.5h14a2 2 0 0 1 2 2v9H6a2 2 0 0 1-2-2z" />
        <path d="M4 8V6a2 2 0 0 1 2-2h11" />
        <path d="M16 11.5h4v3h-4a1.5 1.5 0 0 1 0-3Z" />
      </svg>
    );
  }

  if (icon === "solar") {
    return (
      <svg {...common}>
        <circle cx="18" cy="6" r="2.5" />
        <path d="m4 11 12-1 3 8H7z" />
        <path d="m8 10 2 8m3-8 2 8M6 14h12" />
      </svg>
    );
  }

  if (icon === "device") {
    return (
      <svg {...common}>
        <rect x="6" y="5" width="12" height="14" rx="2" />
        <path d="M9 2v3m6-3v3M9 19v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  if (icon === "analytics") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-5 3 3 5-7" />
      </svg>
    );
  }

  if (icon === "market") {
    return (
      <svg {...common}>
        <path d="M4 9h16l-2-5H6z" />
        <path d="M6 9v10h12V9" />
        <path d="M9 19v-5h6v5" />
        <path d="M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="7" cy="12" r="3" />
      <circle cx="17" cy="12" r="3" />
      <path d="M10 12h4" />
      <path d="m12 9 2 3-2 3" />
    </svg>
  );
}

export function CommunityDepinSection() {
  return (
    <section className="section section--muted" id="community-depin">
      <div className="container">
        <div className="section-heading depin-heading">
          <span className="eyebrow">COMMUNITY ENERGY · DePIN</span>
          <h2>Empowering communities with DePIN technology.</h2>
          <p>
            PowerChain combines renewable-energy operations with Solana settlement,
            verifiable device identity and local energy coordination—without turning
            blockchain state into a substitute for physical meter truth.
          </p>
        </div>

        <div className="depin-grid">
          {features.map((feature) => (
            <article className="depin-card" key={feature.title}>
              <div className="depin-card__icon">
                <DepinIcon icon={feature.icon} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>

        <div className="depin-boundary">
          <span>CANONICAL DELIVERY LOOP</span>
          <strong>
            List → Review → Reserve → Deliver → Meter Evidence → Reconcile →
            Wallet Authorization → Settle
          </strong>
        </div>
      </div>
    </section>
  );
}
