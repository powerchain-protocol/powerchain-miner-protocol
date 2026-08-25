import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

type Client = {
  id: string;
  name: string;
  role?: string;
};

type AuditEvent = {
  id: string | number;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  client_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  previous_hash: string | null;
  entry_hash: string | null;
};

type Verification = {
  scope: string;
  valid: boolean;
  checkedRows: number;
  firstInvalidAuditId: string | number | null;
  expectedHash: string | null;
  actualHash: string | null;
};

type AuditCheckpoint = {
  id: string;
  chain_scope: string;
  audit_head_hash: string;
  last_audit_id: string | number | null;
  checkpoint_hash: string;
  created_by_email: string;
  created_at: string;
};

async function createCheckpoint(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId") || "");
  await consoleApi("/api/v1/audit/checkpoints", {
    method: "POST",
    body: JSON.stringify(clientId ? { clientId } : {}),
  });

  revalidatePath(clientId ? `/audit?client=${clientId}` : "/audit");
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; before?: string }>;
}) {
  let clients: Client[];
  try {
    clients = (await consoleApi<{ clients: Client[] }>("/api/v1/clients")).clients;
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  const params = await searchParams;
  const isSuperadmin = clients.some((client) => client.role === undefined);
  const eligibleClients = isSuperadmin
    ? clients
    : clients.filter(
        (client) =>
          client.role === "CLIENT_ADMIN" || client.role === "FINANCE",
      );

  if (!isSuperadmin && !eligibleClients.length) {
    redirect("/clients");
  }

  const selected =
    eligibleClients.find((client) => client.id === params.client) ??
    (isSuperadmin && !params.client ? null : eligibleClients[0] ?? null);

  const query = new URLSearchParams();
  if (selected) query.set("clientId", selected.id);
  if (params.before) query.set("beforeId", params.before);
  query.set("limit", "100");

  const verifyQuery = selected
    ? `?clientId=${encodeURIComponent(selected.id)}`
    : "";

  const [audit, verification, checkpointResult] = await Promise.all([
    consoleApi<{
      events: AuditEvent[];
      nextBeforeId: string | number | null;
    }>(`/api/v1/audit?${query.toString()}`),
    consoleApi<Verification>(`/api/v1/audit/verify${verifyQuery}`),
    consoleApi<{ checkpoints: AuditCheckpoint[] }>(
      `/api/v1/audit/checkpoints${verifyQuery}`,
    ).catch(() => ({ checkpoints: [] })),
  ]);

  const latestCheckpoint = checkpointResult.checkpoints[0] ?? null;

  return (
    <ConsoleShell
      title="Audit"
      eyebrow="TAMPER-EVIDENT OPERATIONS"
      isSuperadmin={isSuperadmin}
    >
      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">CHAIN SCOPE</span>
            <h2>{selected?.name ?? "Platform"}</h2>
          </div>
          <div className="client-switcher">
            {isSuperadmin && (
              <a
                href="/audit"
                className={!selected ? "selected" : ""}
              >
                Platform
              </a>
            )}
            {eligibleClients.map((client) => (
              <a
                key={client.id}
                href={`/audit?client=${client.id}`}
                className={selected?.id === client.id ? "selected" : ""}
              >
                {client.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="console-metrics audit-metrics">
        <article>
          <span>Chain integrity</span>
          <strong>{verification.valid ? "VALID" : "FAILED"}</strong>
          <small>
            {verification.checkedRows.toLocaleString()} chained events checked
          </small>
        </article>
        <article>
          <span>Scope</span>
          <strong>{selected ? "CLIENT" : "PLATFORM"}</strong>
          <small className="mono">{verification.scope}</small>
        </article>
        <article>
          <span>First invalid</span>
          <strong>{verification.firstInvalidAuditId ?? "—"}</strong>
          <small>
            {verification.valid ? "No hash mismatch" : "Investigation required"}
          </small>
        </article>
      </section>


      <section className="console-panel audit-checkpoint-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">AUDIT CHECKPOINT</span>
            <h2>Exportable chain head</h2>
          </div>
          {verification.valid && verification.checkedRows > 0 && (
            <form action={createCheckpoint}>
              {selected && (
                <input type="hidden" name="clientId" value={selected.id} />
              )}
              <button className="primary-btn">Create checkpoint</button>
            </form>
          )}
        </div>

        {latestCheckpoint ? (
          <div className="audit-checkpoint-grid">
            <span>
              <small>Checkpoint hash</small>
              <code>{latestCheckpoint.checkpoint_hash}</code>
            </span>
            <span>
              <small>Audit head</small>
              <code>{latestCheckpoint.audit_head_hash}</code>
            </span>
            <span>
              <small>Last event</small>
              <strong>{latestCheckpoint.last_audit_id ?? "—"}</strong>
            </span>
            <span>
              <small>Created</small>
              <strong>
                {new Date(latestCheckpoint.created_at).toLocaleString()}
              </strong>
            </span>
          </div>
        ) : (
          <p className="empty">
            No checkpoint has been created for this audit scope.
          </p>
        )}
      </section>

      {!verification.valid && (
        <section className="console-panel audit-failure">
          <span className="section-label">CHAIN VERIFICATION FAILURE</span>
          <h2>Audit history does not match its hash chain</h2>
          <p>
            Expected <code>{verification.expectedHash}</code>
          </p>
          <p>
            Actual <code>{verification.actualHash}</code>
          </p>
        </section>
      )}

      <section className="console-panel">
        <div className="console-panel-head">
          <div>
            <span className="section-label">EVENTS</span>
            <h2>Immutable activity trail</h2>
          </div>
          <span className="count-pill">{audit.events.length}</span>
        </div>

        <div className="audit-table">
          {audit.events.map((event) => (
            <article key={event.id}>
              <div>
                <strong>{event.action}</strong>
                <small>
                  {event.resource_type}
                  {event.resource_id ? ` · ${event.resource_id}` : ""}
                </small>
              </div>
              <div>
                <strong>{event.actor_email}</strong>
                <small>{new Date(event.created_at).toLocaleString()}</small>
              </div>
              <div className="audit-hash">
                <span>HASH</span>
                <code>
                  {event.entry_hash
                    ? `${event.entry_hash.slice(0, 18)}…`
                    : "historical / unchained"}
                </code>
              </div>
            </article>
          ))}
          {!audit.events.length && (
            <p className="empty">No audit events in this scope.</p>
          )}
        </div>

        {audit.nextBeforeId && (
          <div className="audit-pagination">
            <a
              href={`/audit?${new URLSearchParams({
                ...(selected ? { client: selected.id } : {}),
                before: String(audit.nextBeforeId),
              }).toString()}`}
            >
              Older events →
            </a>
          </div>
        )}
      </section>
    </ConsoleShell>
  );
}
