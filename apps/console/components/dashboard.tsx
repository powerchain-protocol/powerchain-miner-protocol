"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Icons } from "@/components/icons";
import { PairNodeModal, ProofDetailsModal } from "@/components/modals";
import { appEvents } from "@/events";
import type { Device, Proof } from "@/lib/types";

type DashboardData = {
  network: "devnet" | "mainnet-beta";
  simulated: boolean;
  metrics: {
    activeNodes: number;
    totalNodes: number;
    verifiedEnergyKwh: number;
    totalRewardBaseUnits: number;
    proofCount: number;
  };
  devices: Device[];
  proofs: Proof[];
};

const demo: DashboardData = {
  network: "devnet",
  simulated: true,
  metrics: {
    activeNodes: 3,
    totalNodes: 4,
    verifiedEnergyKwh: 284.72,
    totalRewardBaseUnits: 284_720_000_000,
    proofCount: 1482,
  },
  devices: [
    { id: "solar-roof-001", publicKeyPem: "", label: "Workshop Solar", renewableType: "solar", source: "modbus_tcp", firmware: "0.2.0", registeredAt: "", lastSeenAt: new Date().toISOString(), status: "online", totalEnergyWh: 156420, totalRewardBaseUnits: 156420000000, lastSequence: 731, temperatureC: 46.1, cpuPercent: 8.2 },
    { id: "wind-north-002", publicKeyPem: "", label: "North Wind Node", renewableType: "wind", source: "http_json", firmware: "0.2.0", registeredAt: "", lastSeenAt: new Date().toISOString(), status: "online", totalEnergyWh: 98210, totalRewardBaseUnits: 98210000000, lastSequence: 544, temperatureC: 42.8, cpuPercent: 5.4 },
    { id: "battery-lab-003", publicKeyPem: "", label: "Battery Lab", renewableType: "battery", source: "modbus_tcp", firmware: "0.2.0", registeredAt: "", lastSeenAt: new Date().toISOString(), status: "online", totalEnergyWh: 30090, totalRewardBaseUnits: 30090000000, lastSequence: 207, temperatureC: 44.0, cpuPercent: 10.1 },
  ],
  proofs: [
    { id: "p1", deviceId: "solar-roof-001", sequence: 731, observedAt: new Date().toISOString(), receivedAt: new Date().toISOString(), renewableType: "solar", energyDeltaWh: 834, averagePowerW: 5010, sampleCount: 12, source: "modbus_tcp", proofDigest: "6f74e34f58e6f9e08b34f4208b8b8b3e", signature: "", rewardBaseUnits: 834000000, status: "verified", network: "devnet" },
    { id: "p2", deviceId: "wind-north-002", sequence: 544, observedAt: new Date(Date.now()-60000).toISOString(), receivedAt: new Date(Date.now()-59000).toISOString(), renewableType: "wind", energyDeltaWh: 511, averagePowerW: 3070, sampleCount: 12, source: "http_json", proofDigest: "90c842d084d4e9a33a291ee9242e7a6d", signature: "", rewardBaseUnits: 511000000, status: "verified", network: "devnet" },
  ],
};

function formatToken(baseUnits: number) {
  return (baseUnits / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function Metric({ eyebrow, value, unit, hint, icon }: { eyebrow: string; value: string; unit?: string; hint: string; icon: ReactNode }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-live">LIVE</span></div>
      <div className="metric-label">{eyebrow}</div>
      <div className="metric-value">{value}{unit && <span>{unit}</span>}</div>
      <div className="metric-hint">{hint}</div>
    </article>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData>(demo);
  const [pairOpen, setPairOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/dashboard", { cache: "no-store" });
      if (!r.ok) return;
      const incoming = await r.json() as DashboardData;
      setData(incoming.metrics.totalNodes === 0 ? { ...demo, network: incoming.network, simulated: true } : incoming);
    } catch {
      // Keep the explicit demo state when the local API is unavailable.
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const controlPlane = typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;
  const installCommand = `sudo POWERCHAIN_SOURCE_ROOT="$PWD" ./os/install.sh`;

  function openPairNode(source: string) {
    appEvents.emit("node:pair-requested", { source });
    setPairOpen(true);
  }

  function selectProof(proof: Proof) {
    appEvents.emit("proof:selected", { proofId: proof.id });
    setSelectedProof(proof);
  }

  const nav = [
    ["Overview", Icons.Overview, "overview"],
    ["Nodes", Icons.Node, "nodes"],
    ["Energy", Icons.Bolt, "energy"],
    ["Proofs", Icons.Proof, "proofs"],
    ["Rewards", Icons.Wallet, "rewards"],
    ["Network", Icons.Network, "network"],
  ] as const;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icons.Bolt /></span>
          <div><strong>PowerChain</strong><small>Renewable Miner OS</small></div>
        </div>

        <nav>
          {nav.map(([label, Icon, target], i) => (
            <a className={i === 0 ? "nav-item active" : "nav-item"} key={label} href={`#${target}`}>
              <Icon /><span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item" href="#network"><Icons.Settings /><span>Settings</span></a>
          <div className="node-identity">
            <span className="avatar">RM</span>
            <div><strong>Operator</strong><small>{data.network}</small></div>
            <span className="status-dot" />
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="crumb">MINER OS <span>/</span> OVERVIEW</div>
            <h1>Renewable Mining</h1>
          </div>
          <div className="top-actions">
            {data.simulated && <span className="demo-badge">SIMULATED PREVIEW</span>}
            <span className="network-pill"><i /> SOLANA · {data.network.toUpperCase()}</span>
            <button className="primary-btn" onClick={() => openPairNode("dashboard-header")}><Icons.Plus /> Pair node</button>
          </div>
        </header>

        <div className="content">
          <section className="hero-panel" id="overview">
            <div className="hero-copy">
              <div className="kicker"><span /> VERIFIED RENEWABLE WORK</div>
              <h2>Turn measured clean energy into verifiable network work.</h2>
              <p>Raspberry Pi nodes sign meter evidence locally. The control plane validates proof continuity, aggregates renewable output and prepares MINER rewards for Solana settlement.</p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => openPairNode("dashboard-hero")}><Icons.Plus /> Connect Raspberry Pi</button>
                <button className="secondary-btn" onClick={() => document.getElementById("proofs")?.scrollIntoView({ behavior: "smooth" })}>Inspect proofs</button>
              </div>
            </div>
            <div className="flow-card" id="network">
              <div className="flow-head"><span>ENERGY PROOF PIPELINE</span><span className="pulse">● LIVE</span></div>
              <div className="flow">
                <div className="flow-node"><span><Icons.Sun /></span><b>Meter</b><small>Physical truth</small></div>
                <i>→</i>
                <div className="flow-node"><span><Icons.Node /></span><b>Pi Node</b><small>Ed25519 sign</small></div>
                <i>→</i>
                <div className="flow-node"><span><Icons.Proof /></span><b>Verify</b><small>Proof policy</small></div>
                <i>→</i>
                <div className="flow-node"><span><Icons.Wallet /></span><b>MINER</b><small>Solana reward</small></div>
              </div>
              <div className="flow-foot"><span>NO PROOF-OF-WORK WASTE</span><span>DEVICE KEYS STAY LOCAL</span></div>
            </div>
          </section>

          <section className="metric-grid" id="rewards">
            <Metric eyebrow="Verified energy" value={data.metrics.verifiedEnergyKwh.toFixed(2)} unit=" kWh" hint="Cumulative accepted proofs" icon={<Icons.Bolt />} />
            <Metric eyebrow="Active nodes" value={`${data.metrics.activeNodes}/${data.metrics.totalNodes || data.metrics.activeNodes}`} hint="Heartbeat < 90 seconds" icon={<Icons.Node />} />
            <Metric eyebrow="Accepted proofs" value={data.metrics.proofCount.toLocaleString()} hint="Signed evidence batches" icon={<Icons.Proof />} />
            <Metric eyebrow="MINER accrued" value={formatToken(data.metrics.totalRewardBaseUnits)} unit=" MINER" hint="Pre-settlement accounting" icon={<Icons.Wallet />} />
          </section>

          <section className="split-grid">
            <article className="panel" id="nodes">
              <div className="panel-head">
                <div><span className="section-label">NODE FLEET</span><h3>Renewable nodes</h3></div>
                <button className="text-btn" onClick={() => openPairNode("node-fleet")}>Add node +</button>
              </div>
              <div className="device-list">
                {data.devices.map((device) => (
                  <div className="device-row" key={device.id}>
                    <div className={`device-icon ${device.renewableType}`}><Icons.Sun /></div>
                    <div className="device-main">
                      <strong>{device.label}</strong>
                      <span>{device.id} · {device.source}</span>
                    </div>
                    <div className="device-energy"><strong>{(device.totalEnergyWh/1000).toFixed(1)} kWh</strong><span>{formatToken(device.totalRewardBaseUnits)} MINER</span></div>
                    <div className="device-health"><i className={device.status === "online" ? "online" : "offline"} /><span>{device.status}</span></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel" id="energy">
              <div className="panel-head">
                <div><span className="section-label">PHYSICAL → DIGITAL</span><h3>Current energy flow</h3></div>
                <span className="quality">98.7% proof quality</span>
              </div>
              <div className="energy-visual">
                <div className="energy-orbit">
                  <div className="energy-core"><Icons.Bolt /><strong>{data.metrics.verifiedEnergyKwh.toFixed(1)}</strong><span>verified kWh</span></div>
                  <span className="orbit-label top">METER</span><span className="orbit-label right">SIGN</span><span className="orbit-label bottom">SETTLE</span><span className="orbit-label left">VERIFY</span>
                </div>
                <div className="energy-stats">
                  <div><span>Source mix</span><strong>Solar · Wind · Battery</strong></div>
                  <div><span>Proof interval</span><strong>60 seconds</strong></div>
                  <div><span>Settlement</span><strong>Token-2022 MINER</strong></div>
                </div>
              </div>
            </article>
          </section>

          <section className="panel" id="proofs">
            <div className="panel-head">
              <div><span className="section-label">PROVENANCE</span><h3>Latest renewable proofs</h3></div>
              <span className="hash-note">SHA-256 · Ed25519</span>
            </div>
            <div className="proof-table-wrap">
              <table className="proof-table">
                <thead><tr><th>Node</th><th>Sequence</th><th>Energy</th><th>Avg power</th><th>Digest</th><th>Reward</th><th>Status</th></tr></thead>
                <tbody>
                  {data.proofs.map((proof) => (
                    <tr key={proof.id} onClick={() => selectProof(proof)}>
                      <td>{proof.deviceId}</td>
                      <td>#{proof.sequence}</td>
                      <td>{proof.energyDeltaWh} Wh</td>
                      <td>{proof.averagePowerW.toLocaleString()} W</td>
                      <td className="mono">{proof.proofDigest.slice(0, 12)}…</td>
                      <td>{formatToken(proof.rewardBaseUnits)} MINER</td>
                      <td><span className="verified"><i /> Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <PairNodeModal
        open={pairOpen}
        onOpenChange={setPairOpen}
        installCommand={installCommand}
      />

      <ProofDetailsModal
        proof={selectedProof}
        onOpenChange={(open) => {
          if (!open) setSelectedProof(null);
        }}
      />
    </main>
  );
}
