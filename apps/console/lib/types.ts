export type Network = "devnet" | "mainnet-beta";

export type Device = {
  id: string;
  publicKeyPem: string;
  label: string;
  renewableType: "solar" | "wind" | "hydro" | "battery" | "ev" | "other";
  source: string;
  model?: string;
  firmware: string;
  registeredAt: string;
  lastSeenAt: string | null;
  status: "online" | "offline" | "warning";
  totalEnergyWh: number;
  totalRewardBaseUnits: number;
  lastSequence: number;
  ip?: string;
  temperatureC?: number;
  cpuPercent?: number;
};

export type Proof = {
  id: string;
  deviceId: string;
  sequence: number;
  observedAt: string;
  receivedAt: string;
  renewableType: Device["renewableType"];
  energyDeltaWh: number;
  averagePowerW: number;
  sampleCount: number;
  source: string;
  proofDigest: string;
  signature: string;
  rewardBaseUnits: number;
  status: "verified" | "rejected" | "pending";
  chainStatus?: "pending" | "submitted" | "confirmed" | "failed";
  chainSignature?: string;
  chainError?: string;
  network: Network;
};

export type StoreState = {
  devices: Device[];
  proofs: Proof[];
};
