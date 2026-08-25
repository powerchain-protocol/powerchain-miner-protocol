"use client";

import { FormEvent, useState } from "react";

export function DeviceKeyPanel({ clientId }: { clientId: string }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSecret("");
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/console/clients/${clientId}/device-keys`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        ttlMinutes: Number(form.get("ttlMinutes") || 60),
      }),
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Could not create device API key.");
      return;
    }

    setSecret(body.apiKey);
  }

  return (
    <section className="console-panel">
      <span className="section-label">RASPBERRY PI ENROLLMENT</span>
      <h2>Device API key</h2>
      <p>Create a client-scoped enrollment key. The full secret is displayed once.</p>
      <form onSubmit={create} className="key-form">
        <label>Key name<input name="name" required placeholder="Solar site installer" /></label>
        <label>Expires
          <select name="ttlMinutes" defaultValue="60">
            <option value="15">15 minutes</option>
            <option value="60">1 hour</option>
            <option value="240">4 hours</option>
            <option value="1440">24 hours</option>
          </select>
        </label>
        <button className="primary-btn" disabled={loading}>{loading ? "Creating…" : "Create key"}</button>
      </form>
      {error && <div className="form-error">{error}</div>}
      {secret && (
        <div className="secret-box">
          <span>Copy now — it will not be shown again.</span>
          <code>{secret}</code>
          <button type="button" onClick={() => navigator.clipboard.writeText(secret)}>Copy key</button>
        </div>
      )}
    </section>
  );
}
