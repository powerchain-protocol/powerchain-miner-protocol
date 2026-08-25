import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { consoleApi } from "@/lib/console-api";

type Client = {
  id: string;
  slug: string;
  name: string;
  legal_name?: string;
  status: string;
  members?: number;
  devices?: number;
  role?: string;
  treasury_wallet?: string;
};

async function createClient(formData: FormData) {
  "use server";
  await consoleApi("/api/v1/clients", {
    method: "POST",
    body: JSON.stringify({
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || ""),
      countryCode: String(formData.get("countryCode") || "") || undefined,
      treasuryWallet: String(formData.get("treasuryWallet") || "") || undefined,
    }),
  });
  revalidatePath("/clients");
}

export default async function ClientsPage() {
  let data: { clients: Client[] };
  try {
    data = await consoleApi("/api/v1/clients");
  } catch (error) {
    if ((error as { status?: number }).status === 401) redirect("/login");
    throw error;
  }

  const isSuperadmin = data.clients.some((client) => client.members !== undefined);

  return (
    <ConsoleShell title="Clients" eyebrow="MULTI-TENANT FLEET" isSuperadmin={isSuperadmin}>
      <section className="console-panel">
        <div className="console-panel-head"><div><span className="section-label">ORGANIZATIONS</span><h2>Renewable mining clients</h2></div><span className="count-pill">{data.clients.length} clients</span></div>
        <div className="client-table">
          <div className="client-row head"><span>Client</span><span>Status</span><span>Members</span><span>Nodes</span><span>Treasury</span></div>
          {data.clients.map((client) => (
            <div className="client-row" key={client.id}>
              <span><a className="client-link" href={`/clients/${client.id}`}><strong>{client.name}</strong><small>{client.slug}</small></a></span>
              <span><b className={`status-chip ${client.status.toLowerCase()}`}>{client.status}</b></span>
              <span>{client.members ?? "—"}</span>
              <span>{client.devices ?? 0}</span>
              <span className="mono">{client.treasury_wallet ? `${client.treasury_wallet.slice(0,8)}…` : "Not set"}</span>
            </div>
          ))}
        </div>
      </section>

      {isSuperadmin && (
        <section className="console-panel">
          <span className="section-label">SUPERADMIN ACTION</span>
          <h2>Create client</h2>
          <form action={createClient} className="inline-form">
            <label>Name<input name="name" required placeholder="Nordic Solar Oy" /></label>
            <label>Slug<input name="slug" required placeholder="nordic-solar" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
            <label>Country<input name="countryCode" maxLength={2} placeholder="FI" /></label>
            <label>Treasury wallet<input name="treasuryWallet" placeholder="Solana address" /></label>
            <button className="primary-btn">Create client</button>
          </form>
        </section>
      )}
    </ConsoleShell>
  );
}
