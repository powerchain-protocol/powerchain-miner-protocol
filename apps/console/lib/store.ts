import { promises as fs } from "node:fs";
import path from "node:path";
import type { Device, Proof, StoreState } from "@/lib/types";

const dataDir = path.resolve(process.cwd(), process.env.POWERCHAIN_DATA_DIR ?? ".data");
const dataFile = path.join(dataDir, "miner-db.json");

const emptyState: StoreState = { devices: [], proofs: [] };

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await atomicWrite(emptyState);
  }
}

async function atomicWrite(state: StoreState) {
  await fs.mkdir(dataDir, { recursive: true });
  const tmp = `${dataFile}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, dataFile);
}

export async function readStore(): Promise<StoreState> {
  await ensureStore();
  const text = await fs.readFile(dataFile, "utf8");
  return JSON.parse(text) as StoreState;
}

let writeChain: Promise<void> = Promise.resolve();

export function mutateStore<T>(mutator: (state: StoreState) => T | Promise<T>): Promise<T> {
  const job = writeChain.then(async () => {
    const state = await readStore();
    const result = await mutator(state);
    await atomicWrite(state);
    return result;
  });

  writeChain = job.then(() => undefined, () => undefined);
  return job;
}

export async function getDevice(id: string): Promise<Device | undefined> {
  const state = await readStore();
  return state.devices.find((d) => d.id === id);
}

export async function upsertDevice(device: Device): Promise<Device> {
  return mutateStore((state) => {
    const index = state.devices.findIndex((d) => d.id === device.id);
    if (index >= 0) state.devices[index] = device;
    else state.devices.push(device);
    return device;
  });
}

export async function appendProof(proof: Proof): Promise<Proof> {
  return mutateStore((state) => {
    state.proofs.unshift(proof);
    state.proofs = state.proofs.slice(0, 5000);
    return proof;
  });
}
