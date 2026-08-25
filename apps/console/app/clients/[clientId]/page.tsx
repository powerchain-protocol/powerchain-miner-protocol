import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { DeviceKeyPanel } from "@/components/device-key-panel";
import { consoleApi } from "@/lib/console-api";

type Client = {
  id: string;
  name: string;
  slug: string;
  status: string;
  role?: string;
};

type Member = {
  id: string;
  role: string;
  status: string;
  reward_wallet?: string;
  user_id: string;
  email: string;
  display_name: string;
};

type Device = {
  id: string;
  external_device_id: string;
  label: string;
  renewable_type: string;
  source: string;
  status: string;
  last_sequence: string;
  total_energy_wh: string;
  total_reward_base_units: string;
  last_seen_at?: string;
  onchain_device_pda?: string;
  owner_user_id?: string | null;
  device_signing_pubkey?: string | null;
  chain_binding_status?: "UNBOUND" | "DERIVED" | "VERIFIED";
  chain_binding_verified_at?: string | null;
  source_hash?: string | null;
};

type SourceRotation = {
  id: string;
  device_id: string;
  device_label: string;
  previous_source_hash: string;
  next_source_hash: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "APPLIED" | "CANCELLED";
  requested_by: string | null;
  requested_by_email?: string | null;
  approved_by_email?: string | null;
  created_at: string;
};

async function requestSourceRotation(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const deviceId = String(formData.get("deviceId"));

  await consoleApi(
    `/api/v1/clients/${clientId}/devices/${deviceId}/source-rotations`,
    {
      method: "POST",
      body: JSON.stringify({
        nextSourceHash: String(formData.get("nextSourceHash") || ""),
        reason: String(formData.get("reason") || ""),
      }),
    },
  );
  revalidatePath(`/clients/${clientId}`);
}

async function decideSourceRotation(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const deviceId = String(formData.get("deviceId"));
  const rotationId = String(formData.get("rotationId"));
  const decision = String(formData.get("decision"));

  await consoleApi(
    `/api/v1/clients/${clientId}/devices/${deviceId}/source-rotations/${rotationId}/${decision}`,
    { method: "POST" },
  );
  revalidatePath(`/clients/${clientId}`);
}

async function verifyChainBinding(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const deviceId = String(formData.get("deviceId"));

  await consoleApi(
    `/api/v1/clients/${clientId}/devices/${deviceId}/chain-binding/verify`,
    { method: "POST" },
  );
  revalidatePath(`/clients/${clientId}`);
}

async function assignDeviceOwner(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const deviceId = String(formData.get("deviceId"));
  const owner = String(formData.get("ownerUserId") || "");

  await consoleApi(`/api/v1/clients/${clientId}/devices/${deviceId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ownerUserId: owner || null,
    }),
  });
  revalidatePath(`/clients/${clientId}`);
}

async function addMember(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  await consoleApi(`/api/v1/clients/${clientId}/members`, {
    method: "POST",
    body: JSON.stringify({
      email: String(formData.get("email") || ""),
      displayName: String(formData.get("displayName") || ""),
      role: String(formData.get("role") || "VIEWER"),
      rewardWallet: String(formData.get("rewardWallet") || "") || undefined,
    }),
  });
  revalidatePath(`/clients/${clientId}`);
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  let clients: Client[];
  try {
    clients = (await consoleApi<{ clients: Client[] }>("/api/v1/clients")).clients;
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  const client = clients.find((item) => item.id === clientId);
  if (!client) redirect("/clients");

  const [members, devices, rotations] = await Promise.all([
    consoleApi<{ members: Member[] }>(`/api/v1/clients/${clientId}/members`).then((r) => r.members),
    consoleApi<{ devices: Device[] }>(`/api/v1/clients/${clientId}/devices`).then((r) => r.devices),
    consoleApi<{ rotations: SourceRotation[] }>(`/api/v1/clients/${clientId}/source-rotations`)
      .then((r) => r.rotations)
      .catch(() => []),
  ]);

  const isSuperadmin = client.role === undefined;
  const canAdmin = isSuperadmin || client.role === "CLIENT_ADMIN";
  const canRequestRotation =
    isSuperadmin || client.role === "CLIENT_ADMIN" || client.role === "OPERATOR";
  const canApproveRotation =
    isSuperadmin || client.role === "CLIENT_ADMIN" || client.role === "VERIFIER";

  const toMiner = (value: string) =>
    (Number(value || "0") / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 3 });

  return (
    <ConsoleShell title={client.name} eyebrow={`CLIENT · ${client.slug}`} isSuperadmin={isSuperadmin}>
      <div className="detail-heading">
        <div><span className={`status-chip ${client.status.toLowerCase()}`}>{client.status}</span><strong>{client.role ?? "SUPERADMIN ACCESS"}</strong></div>
        <a href="/clients">← All clients</a>
      </div>

      <section className="console-metrics client-detail">
        <article><span>Members</span><strong>{members.length}</strong><small>Active identities</small></article>
        <article><span>Devices</span><strong>{devices.length}</strong><small>Renewable nodes</small></article>
        <article><span>Online</span><strong>{devices.filter((d) => d.status === "ONLINE").length}</strong><small>Current fleet</small></article>
        <article><span>Verified energy</span><strong>{(devices.reduce((a,d) => a + Number(d.total_energy_wh), 0)/1000).toFixed(2)} kWh</strong><small>Device totals</small></article>
        <article><span>Rewards</span><strong>{toMiner(String(devices.reduce((a,d) => a + Number(d.total_reward_base_units), 0)))}</strong><small>MINER accrued</small></article>
        <article><span>On-chain mapped</span><strong>{devices.filter((d) => d.onchain_device_pda).length}</strong><small>Device PDAs</small></article>
      </section>

      <section className="console-grid">
        <article className="console-panel">
          <div className="console-panel-head"><div><span className="section-label">ACCESS</span><h2>Members</h2></div><span className="count-pill">{members.length}</span></div>
          <div className="stack-list member-list">
            {members.map((member) => (
              <div key={member.id}>
                <span><strong>{member.display_name}</strong><small>{member.email}</small></span>
                <span><b>{member.role}</b><small>{member.status}</small></span>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="console-panel-head"><div><span className="section-label">FLEET</span><h2>Devices</h2></div><span className="count-pill">{devices.length}</span></div>
          <div className="stack-list device-console-list">
            {devices.map((device) => (
              <div key={device.id} className="device-admin-row">
                <span>
                  <strong>{device.label}</strong>
                  <small>{device.external_device_id} · {device.renewable_type} · {device.source}</small>
                </span>
                <span>
                  <b className={`status-chip ${device.status.toLowerCase()}`}>{device.status}</b>
                  <small>seq {device.last_sequence}</small>
                </span>
                {canAdmin && (
                  <>
                    <form action={assignDeviceOwner} className="owner-form">
                      <input type="hidden" name="clientId" value={clientId} />
                      <input type="hidden" name="deviceId" value={device.id} />
                      <select name="ownerUserId" defaultValue={device.owner_user_id ?? ""}>
                        <option value="">No reward owner</option>
                        {members
                          .filter((member) => member.status === "ACTIVE")
                          .map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                              {member.display_name}
                            </option>
                          ))}
                      </select>
                      <button>Assign</button>
                    </form>
                    <div className="chain-binding-row">
                      <span>
                        <b>{device.chain_binding_status ?? "UNBOUND"}</b>
                        <small>
                          {device.device_signing_pubkey
                            ? `device ${device.device_signing_pubkey.slice(0, 10)}…`
                            : "legacy device identity"}
                        </small>
                      </span>
                      {device.owner_user_id && device.device_signing_pubkey && (
                        <form action={verifyChainBinding}>
                          <input type="hidden" name="clientId" value={clientId} />
                          <input type="hidden" name="deviceId" value={device.id} />
                          <button>
                            {device.chain_binding_status === "VERIFIED"
                              ? "Re-verify Solana"
                              : "Verify Solana binding"}
                          </button>
                        </form>
                      )}
                    </div>
                  </>
                )}
                {canRequestRotation && device.source_hash && (
                  <form action={requestSourceRotation} className="source-rotation-form">
                    <input type="hidden" name="clientId" value={clientId} />
                    <input type="hidden" name="deviceId" value={device.id} />
                    <span>
                      <b>Current source</b>
                      <code>{device.source_hash.slice(0, 14)}…</code>
                    </span>
                    <input
                      name="nextSourceHash"
                      required
                      pattern="[A-Fa-f0-9]{64}"
                      placeholder="New 64-character source hash"
                    />
                    <input
                      name="reason"
                      required
                      minLength={10}
                      placeholder="Reason for meter / EMS replacement"
                    />
                    <button>Request rotation</button>
                  </form>
                )}
              </div>
            ))}
            {!devices.length && <p className="empty">No Raspberry Pi nodes enrolled yet.</p>}
          </div>
        </article>
      </section>


      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">SOURCE IDENTITY CHANGES</span>
            <h2>Meter / EMS rotations</h2>
          </div>
          <span className="count-pill">{rotations.length}</span>
        </div>
        <div className="source-rotation-list">
          {rotations.map((rotation) => (
            <div key={rotation.id}>
              <span>
                <strong>{rotation.device_label}</strong>
                <small>
                  {rotation.previous_source_hash.slice(0, 10)}… →
                  {" "}{rotation.next_source_hash.slice(0, 10)}…
                </small>
                <small>{rotation.reason}</small>
              </span>
              <span>
                <b className={`status-chip ${rotation.status.toLowerCase()}`}>
                  {rotation.status}
                </b>
                <small>{rotation.requested_by_email ?? "unknown requester"}</small>
              </span>
              {rotation.status === "REQUESTED" && canApproveRotation && (
                <form action={decideSourceRotation} className="rotation-actions">
                  <input type="hidden" name="clientId" value={clientId} />
                  <input type="hidden" name="deviceId" value={rotation.device_id} />
                  <input type="hidden" name="rotationId" value={rotation.id} />
                  <button name="decision" value="approve">Approve</button>
                  <button name="decision" value="reject" className="danger-lite">
                    Reject
                  </button>
                </form>
              )}
            </div>
          ))}
          {!rotations.length && (
            <p className="empty">No source-identity changes have been requested.</p>
          )}
        </div>
      </section>

      {canAdmin && (
        <>
          <section className="console-panel">
            <span className="section-label">CLIENT ADMIN</span>
            <h2>Add or update member</h2>
            <form action={addMember} className="member-form">
              <input type="hidden" name="clientId" value={clientId} />
              <label>Name<input name="displayName" required placeholder="Operator name" /></label>
              <label>Email<input name="email" type="email" required placeholder="operator@example.com" /></label>
              <label>Role
                <select name="role" defaultValue="VIEWER">
                  <option>CLIENT_ADMIN</option>
                  <option>OPERATOR</option>
                  <option>FINANCE</option>
                  <option>VERIFIER</option>
                  <option>VIEWER</option>
                </select>
              </label>
              <label>Reward wallet<input name="rewardWallet" placeholder="Optional Solana address" /></label>
              <button className="primary-btn">Save member</button>
            </form>
          </section>
          <DeviceKeyPanel clientId={clientId} />
        </>
      )}
    </ConsoleShell>
  );
}
