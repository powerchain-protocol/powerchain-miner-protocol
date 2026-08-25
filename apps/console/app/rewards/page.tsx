import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { ClaimWalletExecution } from "@/components/claim-wallet-execution";
import { consoleApi } from "@/lib/console-api";
import { decimalToBaseUnits } from "@/lib/token-amount";

type Client = { id: string; name: string; role?: string };

async function createEvidenceVerifier(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));

  await consoleApi("/api/v1/evidence-verifiers", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      verifierId: String(formData.get("verifierId") || ""),
      name: String(formData.get("name") || ""),
      publicKeyPem: String(formData.get("publicKeyPem") || ""),
    }),
  });

  revalidatePath(`/rewards?client=${clientId}`);
}

async function createVerificationPolicy(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));

  await consoleApi("/api/v1/verification-policies", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      name: String(formData.get("name") || ""),
      renewableType: String(formData.get("renewableType") || "solar"),
      minAttestations: Number(formData.get("minAttestations") || 1),
      minQualityBps: Number(formData.get("minQualityBps") || 9000),
      maxEnergyWhPerProof: String(formData.get("maxEnergyWhPerProof") || "10000000"),
      maxAveragePowerW: String(formData.get("maxAveragePowerW") || "") || undefined,
      maxSubmissionDelaySeconds: Number(formData.get("maxSubmissionDelaySeconds") || 604800),
      requireSourceContinuity: true,
      allowHumanVerifiers: formData.get("allowHumanVerifiers") === "on",
      verifierRegistryIds: formData
        .getAll("verifierRegistryIds")
        .map((value) => String(value)),
    }),
  });
  revalidatePath(`/rewards?client=${clientId}`);
}

async function createPolicy(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  await consoleApi("/api/v1/reward-policies", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      name: String(formData.get("name") || ""),
      renewableType: String(formData.get("renewableType") || "solar"),
      unit: "Wh",
      baseUnitsPerUnit: String(formData.get("baseUnitsPerUnit") || ""),
      maxPerProofBaseUnits: String(formData.get("maxPerProofBaseUnits") || ""),
      dailyCapBaseUnits: String(formData.get("dailyCapBaseUnits") || "") || undefined,
      qualityBps: Number(formData.get("qualityBps") || 10000),
      startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
      endsAt: formData.get("endsAt") ? new Date(String(formData.get("endsAt"))).toISOString() : null,
    }),
  });
  revalidatePath(`/rewards?client=${clientId}`);
}

async function createEpoch(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  await consoleApi("/api/v1/reward-epochs", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      policyId: String(formData.get("policyId")),
      startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
      endsAt: new Date(String(formData.get("endsAt"))).toISOString(),
    }),
  });
  revalidatePath(`/rewards?client=${clientId}`);
}

async function requestClaim(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const amountBaseUnits = decimalToBaseUnits(String(formData.get("amountMiner") || ""));
  const destinationWallet = String(formData.get("destinationWallet") || "");
  const idempotencyKey = String(formData.get("idempotencyKey") || "");

  await consoleApi("/api/v1/reward-claims", {
    method: "POST",
    headers: idempotencyKey
      ? { "Idempotency-Key": idempotencyKey }
      : undefined,
    body: JSON.stringify({
      clientId,
      amountBaseUnits,
      destinationWallet,
    }),
  });
  revalidatePath(`/rewards?client=${clientId}`);
}

async function cancelClaim(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const claimId = String(formData.get("claimId"));
  await consoleApi(`/api/v1/reward-claims/${claimId}/cancel`, {
    method: "POST",
  });
  revalidatePath(`/rewards?client=${clientId}`);
}

async function approveClaim(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const claimId = String(formData.get("claimId"));
  await consoleApi(`/api/v1/reward-claims/${claimId}/approve`, { method: "POST" });
  revalidatePath(`/rewards?client=${clientId}`);
}

type RewardSummary = {
  ledger: { net_base_units: string; accrued_base_units: string };
  claims: { total: number; requested: number; confirmed: number; settled_base_units: string };
  epochs: { total: number; open: number };
  energy: { verified_energy_wh: string; verified_proofs: number };
  mine: {
    ledger: { net_base_units: string; accrued_base_units: string };
    claims: { total: number; pending: number; settled_base_units: string };
    rewardWallet: string | null;
  };
};

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  let clients: Client[];
  try {
    clients = (await consoleApi<{ clients: Client[] }>("/api/v1/clients")).clients;
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  const params = await searchParams;
  const selected = clients.find((c) => c.id === params.client) ?? clients[0];
  let summary: RewardSummary | null = null;
  let policies: any[] = [];
  let epochs: any[] = [];
  let claims: any[] = [];
  let verificationPolicies: any[] = [];
  let evidenceVerifiers: any[] = [];
  let actorId: string | null = null;

  try {
    actorId = (
      await consoleApi<{ actor: { userId: string } }>("/api/v1/auth/me")
    ).actor.userId;
  } catch {
    actorId = null;
  }

  if (selected) {
    [summary, policies, epochs, claims, verificationPolicies, evidenceVerifiers] = await Promise.all([
      consoleApi<RewardSummary>(`/api/v1/rewards/summary?clientId=${selected.id}`),
      consoleApi<{ policies: any[] }>(`/api/v1/reward-policies?clientId=${selected.id}`).then((r) => r.policies),
      consoleApi<{ epochs: any[] }>(`/api/v1/reward-epochs?clientId=${selected.id}`).then((r) => r.epochs),
      consoleApi<{ claims: any[] }>(`/api/v1/reward-claims?clientId=${selected.id}`).then((r) => r.claims).catch(() => []),
      consoleApi<{ policies: any[] }>(`/api/v1/verification-policies?clientId=${selected.id}`).then((r) => r.policies),
      consoleApi<{ verifiers: any[] }>(`/api/v1/evidence-verifiers?clientId=${selected.id}`).then((r) => r.verifiers),
    ]);
  }

  const asMiner = (value: string | number | undefined) =>
    (Number(value ?? 0) / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 });
  const claimRequestKey = randomUUID();

  return (
    <ConsoleShell title="Rewards" eyebrow="MINER ECONOMICS">
      <section className="console-panel">
        <div className="console-panel-head">
          <div><span className="section-label">CLIENT SCOPE</span><h2>{selected?.name ?? "No clients"}</h2></div>
          <div className="client-switcher">
            {clients.map((client) => <a key={client.id} href={`/rewards?client=${client.id}`} className={client.id === selected?.id ? "selected" : ""}>{client.name}</a>)}
          </div>
        </div>
      </section>

      {summary && (
        <>
          <section className="console-metrics reward">
            <article><span>Verified energy</span><strong>{(Number(summary.energy.verified_energy_wh)/1000).toFixed(2)} kWh</strong><small>{summary.energy.verified_proofs} proofs</small></article>
            <article><span>Accrued</span><strong>{asMiner(summary.ledger.accrued_base_units)} MINER</strong><small>Ledger accrual</small></article>
            <article><span>Available net</span><strong>{asMiner(summary.ledger.net_base_units)} MINER</strong><small>After holds/adjustments</small></article>
            <article><span>Open epochs</span><strong>{summary.epochs.open}</strong><small>{summary.epochs.total} total</small></article>
            <article><span>Requested claims</span><strong>{summary.claims.requested}</strong><small>{summary.claims.total} total</small></article>
            <article><span>Settled</span><strong>{asMiner(summary.claims.settled_base_units)} MINER</strong><small>{summary.claims.confirmed} confirmed</small></article>
          </section>

          <section className="console-grid">
            <article className="console-panel">
              <div className="console-panel-head"><div><span className="section-label">POLICIES</span><h2>Reward policies</h2></div><span className="count-pill">{policies.length}</span></div>
              <div className="stack-list">
                {policies.map((p) => <div key={p.id}><span><strong>{p.name}</strong><small>{p.renewable_type} · {p.unit} · quality {p.quality_bps ?? 10000} bps</small></span><span><b>{asMiner(p.base_units_per_unit)}</b><small>MINER / Wh</small></span></div>)}
                {!policies.length && <p className="empty">No reward policy configured.</p>}
              </div>
            </article>

            <article className="console-panel">
              <div className="console-panel-head"><div><span className="section-label">EPOCHS</span><h2>Reward epochs</h2></div><span className="count-pill">{epochs.length}</span></div>
              <div className="stack-list">
                {epochs.slice(0,6).map((e) => <div key={e.id}><span><strong>{e.policy_name}</strong><small>{new Date(e.starts_at).toLocaleDateString()} → {new Date(e.ends_at).toLocaleDateString()}</small></span><span><b className={`status-chip ${e.status.toLowerCase()}`}>{e.status}</b></span></div>)}
                {!epochs.length && <p className="empty">No epochs yet.</p>}
              </div>
            </article>
          </section>



          {(selected.role === undefined || selected.role === "CLIENT_ADMIN") && (
            <section className="console-panel">
              <span className="section-label">REGISTERED EVIDENCE VERIFIERS</span>
              <h2>Service verifier identity</h2>
              <p>
                Register the public half of an Ed25519 verifier key. The private key stays
                on the verifier worker.
              </p>
              <form action={createEvidenceVerifier} className="verifier-form">
                <input type="hidden" name="clientId" value={selected.id} />
                <label>Name<input name="name" required placeholder="Revenue meter verifier" /></label>
                <label>Verifier ID<input name="verifierId" required placeholder="meter-rules-01" /></label>
                <label className="verifier-public-key">
                  Ed25519 public key PEM
                  <textarea name="publicKeyPem" required rows={5} placeholder="-----BEGIN PUBLIC KEY-----" />
                </label>
                <button className="primary-btn">Register verifier</button>
              </form>

              <div className="verification-policy-list">
                {evidenceVerifiers.map((verifier) => (
                  <div key={verifier.id}>
                    <span>
                      <strong>{verifier.name}</strong>
                      <small>{verifier.verifier_id}</small>
                    </span>
                    <span>
                      <b>{verifier.status}</b>
                      <small>{verifier.id}</small>
                    </span>
                  </div>
                ))}
                {!evidenceVerifiers.length && <p className="empty">No service verifiers registered.</p>}
              </div>
            </section>
          )}

          {(selected.role === undefined || selected.role === "CLIENT_ADMIN") && (
            <section className="console-panel">
              <span className="section-label">PROOF OF ENERGY VERIFICATION</span>
              <h2>Create verification policy</h2>
              <form action={createVerificationPolicy} className="verification-form">
                <input type="hidden" name="clientId" value={selected.id} />
                <label>Name<input name="name" required placeholder="Solar evidence v1" /></label>
                <label>Source<select name="renewableType" defaultValue="solar"><option>solar</option><option>wind</option><option>hydro</option><option>battery</option><option>ev</option><option>other</option></select></label>
                <label>Attestations<input name="minAttestations" type="number" min="1" max="10" defaultValue="1" required /></label>
                <label>Min quality bps<input name="minQualityBps" type="number" min="1" max="10000" defaultValue="9000" required /></label>
                <label>Max Wh / proof<input name="maxEnergyWhPerProof" inputMode="numeric" defaultValue="10000000" required /></label>
                <label>Max average W<input name="maxAveragePowerW" inputMode="numeric" placeholder="optional" /></label>
                <label>Offline delay sec<input name="maxSubmissionDelaySeconds" type="number" min="60" max="2592000" defaultValue="604800" required /></label>
                <label className="checkbox-label">
                  <input name="allowHumanVerifiers" type="checkbox" defaultChecked />
                  Allow human verifiers
                </label>
                <label className="verifier-select">
                  Service verifiers
                  <select name="verifierRegistryIds" multiple size={Math.min(4, Math.max(2, evidenceVerifiers.length))}>
                    {evidenceVerifiers
                      .filter((verifier) => verifier.status === "ACTIVE")
                      .map((verifier) => (
                        <option key={verifier.id} value={verifier.id}>
                          {verifier.name} · {verifier.verifier_id}
                        </option>
                      ))}
                  </select>
                </label>
                <button className="primary-btn">Create verification policy</button>
              </form>

              <div className="verification-policy-list">
                {verificationPolicies.map((policy) => (
                  <div key={policy.id}>
                    <span><strong>{policy.name}</strong><small>{policy.renewable_type}</small></span>
                    <span><b>{policy.min_attestations} attestation(s)</b><small>min {policy.min_quality_bps} bps</small></span>
                  </div>
                ))}
                {!verificationPolicies.length && <p className="empty">No evidence policy configured.</p>}
              </div>
            </section>
          )}

          {(selected.role === undefined || selected.role === "CLIENT_ADMIN") && (
            <section className="console-panel">
              <span className="section-label">REWARD POLICY</span>
              <h2>Create policy</h2>
              <form action={createPolicy} className="reward-form">
                <input type="hidden" name="clientId" value={selected.id} />
                <label>Name<input name="name" required placeholder="Solar generation v1" /></label>
                <label>Source<select name="renewableType" defaultValue="solar"><option>solar</option><option>wind</option><option>hydro</option><option>battery</option><option>ev</option><option>other</option></select></label>
                <label>Base units / Wh<input name="baseUnitsPerUnit" required inputMode="numeric" placeholder="1000000" /></label>
                <label>Max / proof<input name="maxPerProofBaseUnits" required inputMode="numeric" placeholder="100000000000" /></label>
                <label>Daily cap<input name="dailyCapBaseUnits" inputMode="numeric" placeholder="optional" /></label>
                <label>Verified quality bps<input name="qualityBps" inputMode="numeric" defaultValue="10000" min="1" max="10000" /></label>
                <label>Starts<input name="startsAt" type="datetime-local" required /></label>
                <label>Ends<input name="endsAt" type="datetime-local" /></label>
                <button className="primary-btn">Create policy</button>
              </form>
            </section>
          )}

          {(selected.role === undefined || selected.role === "CLIENT_ADMIN" || selected.role === "FINANCE") && policies.length > 0 && (
            <section className="console-panel">
              <span className="section-label">REWARD EPOCH</span>
              <h2>Open epoch</h2>
              <form action={createEpoch} className="reward-form epoch">
                <input type="hidden" name="clientId" value={selected.id} />
                <label>Policy<select name="policyId">{policies.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                <label>Starts<input name="startsAt" type="datetime-local" required /></label>
                <label>Ends<input name="endsAt" type="datetime-local" required /></label>
                <button className="primary-btn">Open epoch</button>
              </form>
            </section>
          )}


          {selected.role !== undefined && (
            <section className="console-panel">
              <div className="console-panel-head">
                <div>
                  <span className="section-label">MY AVAILABLE REWARD</span>
                  <h2>{asMiner(summary.mine.ledger.net_base_units)} MINER</h2>
                </div>
                <span className="count-pill">
                  {summary.mine.claims.pending} pending
                </span>
              </div>

              {summary.mine.rewardWallet ? (
                <form action={requestClaim} className="claim-request-form">
                  <input type="hidden" name="clientId" value={selected.id} />
                  <input
                    type="hidden"
                    name="destinationWallet"
                    value={summary.mine.rewardWallet}
                  />
                  <input
                    type="hidden"
                    name="idempotencyKey"
                    value={claimRequestKey}
                  />
                  <label>
                    Amount (MINER)
                    <input
                      name="amountMiner"
                      inputMode="decimal"
                      placeholder="100.0"
                      required
                    />
                  </label>
                  <label>
                    Destination
                    <input
                      value={summary.mine.rewardWallet}
                      readOnly
                      className="mono"
                    />
                  </label>
                  <button className="primary-btn">Request reward</button>
                </form>
              ) : (
                <p className="empty">
                  Configure your Solana reward wallet before requesting MINER.
                </p>
              )}
            </section>
          )}

          <section className="console-panel">
            <div className="console-panel-head"><div><span className="section-label">CLAIMS</span><h2>Reward claims</h2></div><span className="count-pill">{claims.length}</span></div>
            <div className="client-table claims">
              <div className="client-row head"><span>Requester</span><span>Amount</span><span>Status</span><span>Wallet</span><span>Created</span></div>
              {claims.map((claim) => <div className="client-row" key={claim.id}>
                <span>{claim.requested_by_email}</span>
                <span>{asMiner(claim.amount_base_units)} MINER</span>
                <span>
                  <b className={`status-chip ${claim.status.toLowerCase()}`}>{claim.status}</b>
                  {claim.status === "REQUESTED" && (selected.role === undefined || selected.role === "FINANCE") && (
                    <form action={approveClaim} className="inline-action">
                      <input type="hidden" name="clientId" value={selected.id} />
                      <input type="hidden" name="claimId" value={claim.id} />
                      <button>Approve</button>
                    </form>
                  )}
                  {claim.requested_by === actorId &&
                    ["REQUESTED", "APPROVED", "FAILED"].includes(claim.status) && (
                      <form action={cancelClaim} className="inline-action">
                        <input type="hidden" name="clientId" value={selected.id} />
                        <input type="hidden" name="claimId" value={claim.id} />
                        <button>Cancel</button>
                      </form>
                    )}
                  {claim.requested_by === actorId && claim.status === "APPROVED" && (
                    <ClaimWalletExecution
                      claimId={claim.id}
                      onDoneHref={`/rewards?client=${selected.id}`}
                    />
                  )}
                  {claim.status === "CONFIRMED" && claim.chain_signature && (
                    <small className="claim-signature mono">
                      {claim.chain_signature.slice(0, 14)}…
                    </small>
                  )}
                </span>
                <span className="mono">{claim.destination_wallet.slice(0,8)}…</span>
                <span>{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>)}
            </div>
          </section>
        </>
      )}
    </ConsoleShell>
  );
}
