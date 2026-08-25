"use client";

import { useState } from "react";

export function ComputeKeyPanel({
  agentId,
}: {
  agentId: string;
}) {
  const [name, setName] = useState("Agent runtime");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setMessage("");
    setApiKey(null);

    try {
      const response = await fetch(
        `/api/console/agents/${agentId}/compute/api-keys`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            ttlDays: 90,
          }),
        },
      );
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      setApiKey(body.apiKey);
      setMessage(
        "Copy this key now. PowerChain stores only its SHA-256 hash.",
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setMessage("Compute API key copied.");
  }

  return (
    <div className="compute-key-panel">
      <div className="compute-key-panel__row">
        <label>
          Key name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
          />
        </label>
        <button
          type="button"
          className="primary-btn"
          onClick={generate}
          disabled={busy || name.trim().length < 2}
        >
          {busy ? "Generating…" : "Generate API key"}
        </button>
      </div>

      {apiKey && (
        <div className="compute-secret">
          <span>ONE-TIME SECRET</span>
          <code>{apiKey}</code>
          <button type="button" onClick={copy}>
            Copy
          </button>
        </div>
      )}

      {message && <small className="compute-message">{message}</small>}
    </div>
  );
}
