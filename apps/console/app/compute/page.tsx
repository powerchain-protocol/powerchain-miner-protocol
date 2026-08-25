import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ComputeKeyPanel } from "@/components/compute-key-panel";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

type Client = {
  id: string;
  name: string;
  role?: string;
};

type Member = {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
};

type Agent = {
  id: string;
  client_id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  wallet_chain: "solana" | "sui";
  wallet_address: string;
  status: string;
  compute_status?: string;
  endpoint_base_url?: string;
  auto_topup_enabled?: boolean;
  preferred_chain?: string;
  preferred_asset_symbol?: string | null;
  balance_microunits?: string;
};

type ComputeModel = {
  id: string;
  name: string;
  description: string;
  contextLength: number | null;
  inferenceReady: boolean;
  maxOutputTokens: number;
};

type ComputeDetail = {
  agent: Agent & {
    topup_amount_microunits: string;
    low_balance_threshold_microunits: string;
    max_auto_topup_per_day_microunits: string;
  };
  balance: {
    balanceMicrounits: string;
    reservedMicrounits: string;
    availableMicrounits: string;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    key_prefix: string;
    status: string;
    last_used_at: string | null;
    expires_at: string | null;
  }>;
  usage: Array<{
    id: string;
    request_id: string;
    model: string;
    status: string;
    actual_microunits: string | null;
    input_tokens: string | null;
    output_tokens: string | null;
    created_at: string;
  }>;
  topups: Array<{
    id: string;
    status: string;
    trigger: string;
    requested_credit_microunits: string;
    required_asset_base_units: string;
    chain: string;
    symbol: string;
    created_at: string;
  }>;
};

function computeUnits(
  value: string | number | null | undefined,
  grouped = true,
) {
  const units = BigInt(String(value ?? "0"));
  const whole = units / 1_000_000n;
  const fraction = (units % 1_000_000n)
    .toString()
    .padStart(6, "0")
    .replace(/0+$/, "")
    .slice(0, 4);

  const wholeText = grouped
    ? whole.toLocaleString()
    : whole.toString();

  return fraction
    ? `${wholeText}.${fraction}`
    : `${wholeText}.00`;
}

async function createAgent(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  await consoleApi("/api/v1/agents", {
    method: "POST",
    body: JSON.stringify({
      clientId,
      ownerUserId: String(formData.get("ownerUserId")),
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      walletChain: String(formData.get("walletChain")),
      walletAddress: String(formData.get("walletAddress")),
    }),
  });
  revalidatePath(`/compute?client=${clientId}`);
}

async function updateCompute(formData: FormData) {
  "use server";
  const clientId = String(formData.get("clientId"));
  const agentId = String(formData.get("agentId"));

  const micro = (name: string) =>
    String(
      Math.round(
        Number(formData.get(name) || 0) * 1_000_000,
      ),
    );

  await consoleApi(
    `/api/v1/agents/${agentId}/compute`,
    {
      method: "PATCH",
      body: JSON.stringify({
        autoTopupEnabled:
          formData.get("autoTopupEnabled") === "on",
        preferredChain:
          String(formData.get("preferredChain")),
        preferredAssetSymbol:
          String(formData.get("preferredAssetSymbol") || "") ||
          null,
        topupAmountMicrounits:
          micro("topupAmount"),
        lowBalanceThresholdMicrounits:
          micro("lowBalanceThreshold"),
        maxAutoTopupPerDayMicrounits:
          micro("maxAutoTopupPerDay"),
      }),
    },
  );

  revalidatePath(
    `/compute?client=${clientId}&agent=${agentId}`,
  );
}

export default async function ComputePage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string;
    agent?: string;
  }>;
}) {
  let clients: Client[];
  let computeModels: ComputeModel[];
  try {
    const [clientResult, modelResult] =
      await Promise.all([
        consoleApi<{ clients: Client[] }>(
          "/api/v1/clients",
        ),
        consoleApi<{ models: ComputeModel[] }>(
          "/api/v1/compute/models",
        ),
      ]);
    clients = clientResult.clients;
    computeModels = modelResult.models;
  } catch (error) {
    if ((error as { status?: number }).status === 401) {
      redirect("/login");
    }
    throw error;
  }

  const params = await searchParams;
  const selectedClient =
    clients.find((client) => client.id === params.client) ??
    clients[0] ??
    null;

  if (!selectedClient) {
    return (
      <ConsoleShell
        title="Agent Compute"
        eyebrow="WALLET-FUNDED INFRASTRUCTURE"
      >
        <section className="console-panel">
          <p className="empty">
            Create a client before configuring agents.
          </p>
        </section>
      </ConsoleShell>
    );
  }

  const [agentsResult, membersResult] = await Promise.all([
    consoleApi<{ agents: Agent[] }>(
      `/api/v1/agents?clientId=${selectedClient.id}`,
    ),
    consoleApi<{ members: Member[] }>(
      `/api/v1/clients/${selectedClient.id}/members`,
    ),
  ]);

  const selectedAgent =
    agentsResult.agents.find(
      (agent) => agent.id === params.agent,
    ) ??
    agentsResult.agents[0] ??
    null;

  const detail = selectedAgent
    ? await consoleApi<ComputeDetail>(
        `/api/v1/agents/${selectedAgent.id}/compute`,
      )
    : null;

  const isSuperadmin =
    selectedClient.role === undefined;
  const canManage =
    isSuperadmin ||
    selectedClient.role === "CLIENT_ADMIN" ||
    selectedClient.role === "FINANCE";
  const canCreateAgent =
    isSuperadmin ||
    selectedClient.role === "CLIENT_ADMIN";

  return (
    <ConsoleShell
      title="Agent Compute"
      eyebrow="WALLET-FUNDED INFRASTRUCTURE"
      isSuperadmin={isSuperadmin}
    >
      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">AGENTOS COMPUTE</span>
            <h2>Identity, funds and compute in one agent</h2>
          </div>
          <div className="client-switcher">
            {clients.map((client) => (
              <a
                key={client.id}
                href={`/compute?client=${client.id}`}
                className={
                  client.id === selectedClient.id
                    ? "selected"
                    : ""
                }
              >
                {client.name}
              </a>
            ))}
          </div>
        </div>

        <div className="compute-architecture-strip">
          <span><b>Agent identity</b><small>owner + wallet</small></span>
          <i>→</i>
          <span><b>Compute credit</b><small>append-only ledger</small></span>
          <i>→</i>
          <span><b>API key</b><small>runtime access</small></span>
          <i>→</i>
          <span><b>Endpoint</b><small>OpenAI-compatible</small></span>
        </div>
      </section>

      <div className="compute-layout">
        <section className="console-panel compute-agent-list">
          <div className="console-panel-head">
            <div>
              <span className="section-label">AGENTS</span>
              <h2>{agentsResult.agents.length} configured</h2>
            </div>
          </div>

          <div className="compute-agent-items">
            {agentsResult.agents.map((agent) => (
              <a
                href={`/compute?client=${selectedClient.id}&agent=${agent.id}`}
                className={
                  selectedAgent?.id === agent.id
                    ? "active"
                    : ""
                }
                key={agent.id}
              >
                <span>
                  <strong>{agent.name}</strong>
                  <small>{agent.slug}</small>
                </span>
                <span>
                  <b>{computeUnits(agent.balance_microunits)} credits</b>
                  <small>{agent.wallet_chain}</small>
                </span>
              </a>
            ))}
            {!agentsResult.agents.length && (
              <p className="empty">
                No AgentOS agents configured.
              </p>
            )}
          </div>
        </section>

        {detail && (
          <section className="console-panel compute-detail">
            <div className="console-panel-head">
              <div>
                <span className="section-label">COMPUTE ACCOUNT</span>
                <h2>{detail.agent.name}</h2>
              </div>
              <span className="count-pill">
                {detail.agent.compute_status}
              </span>
            </div>

            <div className="compute-balance-grid">
              <article>
                <span>Available</span>
                <strong>
                  {computeUnits(
                    detail.balance.availableMicrounits,
                  )}
                </strong>
                <small>compute credits</small>
              </article>
              <article>
                <span>Reserved</span>
                <strong>
                  {computeUnits(
                    detail.balance.reservedMicrounits,
                  )}
                </strong>
                <small>in-flight requests</small>
              </article>
              <article>
                <span>Wallet</span>
                <strong>{detail.agent.wallet_chain}</strong>
                <small className="mono">
                  {detail.agent.wallet_address.slice(0, 14)}…
                </small>
              </article>
            </div>

            <div className="compute-endpoint">
              <span>BASE URL</span>
              <code>
                {detail.agent.endpoint_base_url ??
                  "https://compute.powerchain.energy/v1"}
              </code>
            </div>

            {canManage && (
              <form
                action={updateCompute}
                className="compute-settings-form"
              >
                <input
                  type="hidden"
                  name="clientId"
                  value={selectedClient.id}
                />
                <input
                  type="hidden"
                  name="agentId"
                  value={detail.agent.id}
                />

                <label className="compute-toggle">
                  <input
                    type="checkbox"
                    name="autoTopupEnabled"
                    defaultChecked={
                      detail.agent.auto_topup_enabled
                    }
                  />
                  <span>
                    <b>Auto-top up</b>
                    <small>
                      Create a wallet funding intent when compute
                      credit falls below threshold.
                    </small>
                  </span>
                </label>

                <label>
                  Preferred chain
                  <select
                    name="preferredChain"
                    defaultValue={
                      detail.agent.preferred_chain
                    }
                  >
                    <option value="solana">Solana</option>
                    <option value="sui">Sui</option>
                  </select>
                </label>

                <label>
                  Funding asset
                  <input
                    name="preferredAssetSymbol"
                    defaultValue={
                      detail.agent
                        .preferred_asset_symbol ?? ""
                    }
                    placeholder="USDC"
                  />
                </label>

                <label>
                  Top-up amount
                  <input
                    name="topupAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={computeUnits(
                      detail.agent
                        .topup_amount_microunits,
                      false,
                    )}
                  />
                </label>

                <label>
                  Low balance threshold
                  <input
                    name="lowBalanceThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={computeUnits(
                      detail.agent
                        .low_balance_threshold_microunits,
                      false,
                    )}
                  />
                </label>

                <label>
                  Daily auto-top-up cap
                  <input
                    name="maxAutoTopupPerDay"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={computeUnits(
                      detail.agent
                        .max_auto_topup_per_day_microunits,
                      false,
                    )}
                  />
                </label>

                <button className="primary-btn">
                  Save compute policy
                </button>
              </form>
            )}

            {isSuperadmin ||
            selectedClient.role === "CLIENT_ADMIN" ? (
              <div className="compute-key-zone">
                <span className="section-label">API ACCESS</span>
                <ComputeKeyPanel
                  agentId={detail.agent.id}
                />
              </div>
            ) : null}
          </section>
        )}
      </div>

      {detail && (
        <section className="console-panel">
          <div className="console-panel-head">
            <div>
              <span className="section-label">USAGE</span>
              <h2>Recent compute requests</h2>
            </div>
            <span className="count-pill">
              {detail.usage.length}
            </span>
          </div>

          <div className="compute-usage-table">
            <div className="compute-usage-row head">
              <span>Request</span>
              <span>Model</span>
              <span>Status</span>
              <span>Tokens</span>
              <span>Cost</span>
            </div>
            {detail.usage.map((item) => (
              <div
                className="compute-usage-row"
                key={item.id}
              >
                <span className="mono">
                  {item.request_id.slice(0, 16)}…
                </span>
                <span>{item.model}</span>
                <span>
                  <b
                    className={`status-chip ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </b>
                </span>
                <span>
                  {Number(
                    item.input_tokens ?? 0,
                  ).toLocaleString()}
                  {" / "}
                  {Number(
                    item.output_tokens ?? 0,
                  ).toLocaleString()}
                </span>
                <span>
                  {computeUnits(
                    item.actual_microunits,
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}


      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">AVAILABLE MODELS</span>
            <h2>Discover from the compute endpoint</h2>
          </div>
          <span className="count-pill">
            {computeModels.filter((model) => model.inferenceReady).length}
            {" / "}
            {computeModels.length} routable
          </span>
        </div>

        <p className="compute-model-note">
          Agent runtimes should call <code>/models</code> whenever they
          need to validate a model ID. Catalog entries remain visible
          here even before billing/routing is enabled.
        </p>

        <div className="compute-model-grid">
          {computeModels.map((model) => (
            <article
              key={model.id}
              className={
                model.inferenceReady
                  ? "compute-model-card ready"
                  : "compute-model-card"
              }
            >
              <div>
                <span>{model.name}</span>
                <b>
                  {model.inferenceReady ? "ROUTABLE" : "CATALOG"}
                </b>
              </div>
              <code>{model.id}</code>
              <p>{model.description}</p>
              <small>
                Context{" "}
                {model.contextLength
                  ? model.contextLength.toLocaleString()
                  : "not configured"}
              </small>
            </article>
          ))}
        </div>
      </section>

      {canCreateAgent && (
        <section className="console-panel">
          <span className="section-label">NEW AGENT</span>
          <h2>Create AgentOS compute identity</h2>
          <form
            action={createAgent}
            className="compute-create-agent"
          >
            <input
              type="hidden"
              name="clientId"
              value={selectedClient.id}
            />
            <label>
              Agent name
              <input
                name="name"
                required
                placeholder="Grid Researcher"
              />
            </label>
            <label>
              Slug
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="grid-researcher"
              />
            </label>
            <label>
              Owner
              <select name="ownerUserId" required>
                {membersResult.members
                  .filter(
                    (member) =>
                      member.status === "ACTIVE",
                  )
                  .map((member) => (
                    <option
                      value={member.user_id}
                      key={member.user_id}
                    >
                      {member.display_name} · {member.role}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Wallet chain
              <select
                name="walletChain"
                defaultValue="solana"
              >
                <option value="solana">Solana</option>
                <option value="sui">Sui</option>
              </select>
            </label>
            <label className="compute-wallet-field">
              Agent wallet
              <input
                name="walletAddress"
                required
                placeholder="Agent wallet address"
              />
            </label>
            <button className="primary-btn">
              Create agent
            </button>
          </form>
        </section>
      )}
    </ConsoleShell>
  );
}
