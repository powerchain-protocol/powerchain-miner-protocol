import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

type Client = {
  id: string;
  name: string;
  role?: string;
};

type Proof = {
  id: string;
  sequence: string;
  observedAt: string;
  energyWh: string;
  averagePowerW: string;
  sampleCount: number;
  reportedQualityBps: number;
  qualityBps: number;
  proofDigest: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rewardBaseUnits: string;
  chainStatus: string;
  chainReconciliationMethod?: "TRANSACTION" | "STATE" | null;
  rejectionReason?: string;
  deviceId: string;
  deviceLabel: string;
  renewableType: string;
  approvals: number;
  rejections: number;
  requiredAttestations: number;
  allowHumanVerifiers: boolean;
};

async function attestProof(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const proofId = String(formData.get("proofId"));

  await consoleApi(`/api/v1/proofs/${proofId}/attest`, {
    method: "POST",
    body: JSON.stringify({
      decision: String(formData.get("decision")),
      qualityBps: Number(formData.get("qualityBps") || 10000),
      reason: String(formData.get("reason") || "") || undefined,
      metadata: { source: "nextjs-verifier-console" },
    }),
  });

  revalidatePath(`/proofs?client=${clientId}`);
}

export default async function ProofsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; status?: string }>;
}) {
  let clients: Client[];
  try {
    clients = (await consoleApi<{ clients: Client[] }>("/api/v1/clients")).clients;
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  const params = await searchParams;
  const selected = clients.find((client) => client.id === params.client) ?? clients[0];
  const status =
    params.status === "VERIFIED" || params.status === "REJECTED"
      ? params.status
      : "PENDING";

  const proofs = selected
    ? (
        await consoleApi<{ proofs: Proof[] }>(
          `/api/v1/proofs?clientId=${selected.id}&status=${status}&limit=100`,
        )
      ).proofs
    : [];

  const canVerify = selected?.role === undefined || selected?.role === "VERIFIER";
  const toMiner = (value: string) =>
    (Number(value || "0") / 1_000_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });

  return (
    <ConsoleShell title="Proof Review" eyebrow="EVIDENCE VERIFICATION">
      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">CLIENT / STATUS</span>
            <h2>{selected?.name ?? "No clients"}</h2>
          </div>
          <div className="proof-filters">
            {clients.map((client) => (
              <a
                key={client.id}
                className={client.id === selected?.id ? "selected" : ""}
                href={`/proofs?client=${client.id}&status=${status}`}
              >
                {client.name}
              </a>
            ))}
          </div>
        </div>
        <div className="proof-status-tabs">
          {["PENDING", "VERIFIED", "REJECTED"].map((item) => (
            <a
              key={item}
              className={status === item ? "selected" : ""}
              href={`/proofs?client=${selected?.id ?? ""}&status=${item}`}
            >
              {item}
            </a>
          ))}
        </div>
      </section>

      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">PROOF OF ENERGY</span>
            <h2>{status.toLowerCase()} evidence</h2>
          </div>
          <span className="count-pill">{proofs.length}</span>
        </div>

        <div className="evidence-list">
          {proofs.map((proof) => (
            <article className="evidence-card" key={proof.id}>
              <div className="evidence-card-head">
                <div>
                  <strong>{proof.deviceLabel}</strong>
                  <span>{proof.deviceId} · {proof.renewableType} · #{proof.sequence}</span>
                </div>
                <b className={`status-chip ${proof.status.toLowerCase()}`}>{proof.status}</b>
              </div>

              <div className="evidence-metrics">
                <span>Energy<strong>{Number(proof.energyWh).toLocaleString()} Wh</strong></span>
                <span>Avg power<strong>{Number(proof.averagePowerW).toLocaleString()} W</strong></span>
                <span>Samples<strong>{proof.sampleCount}</strong></span>
                <span>Reported quality<strong>{proof.reportedQualityBps} bps</strong></span>
                <span>Attestations<strong>{proof.approvals}/{proof.requiredAttestations}</strong></span>
                <span>Reward<strong>{toMiner(proof.rewardBaseUnits)} MINER</strong></span>
                <span>Chain<strong>{proof.chainStatus}</strong></span>
              </div>

              <div className="evidence-digest">
                <span>SHA-256</span>
                <code>{proof.proofDigest}</code>
              </div>
              {proof.chainReconciliationMethod && (
                <div className="proof-chain-method">
                  Solana reconciliation: {proof.chainReconciliationMethod}
                </div>
              )}

              {proof.rejectionReason && (
                <div className="proof-rejection">{proof.rejectionReason}</div>
              )}

              {proof.status === "PENDING" && !proof.allowHumanVerifiers && (
                <div className="service-verifier-note">
                  This proof requires registered signed service verifiers.
                </div>
              )}

              {proof.status === "PENDING" && canVerify && selected && proof.allowHumanVerifiers && (
                <form action={attestProof} className="attestation-form">
                  <input type="hidden" name="clientId" value={selected.id} />
                  <input type="hidden" name="proofId" value={proof.id} />
                  <label>
                    Verified quality
                    <input
                      name="qualityBps"
                      type="number"
                      min="1"
                      max="10000"
                      defaultValue="10000"
                      required
                    />
                  </label>
                  <label className="attestation-reason">
                    Reason
                    <input name="reason" placeholder="Evidence review note" />
                  </label>
                  <button name="decision" value="APPROVE" className="approve-btn">
                    Approve
                  </button>
                  <button name="decision" value="REJECT" className="reject-btn">
                    Reject
                  </button>
                </form>
              )}
            </article>
          ))}

          {!proofs.length && (
            <div className="empty-state">
              No {status.toLowerCase()} proofs in this client scope.
            </div>
          )}
        </div>
      </section>
    </ConsoleShell>
  );
}
