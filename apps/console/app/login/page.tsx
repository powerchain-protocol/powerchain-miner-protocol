"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/session/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Sign in failed.");
      return;
    }

    window.location.href = "/superadmin";
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-mark">P</span>
          <div><strong>PowerChain</strong><span>Renewable Miner OS</span></div>
        </div>
        <div className="auth-copy">
          <span className="section-label">SECURE CONSOLE</span>
          <h1>Sign in to Miner OS</h1>
          <p>Manage renewable clients, node fleets, roles, reward epochs and treasury settlement.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" name="email" required autoComplete="email" /></label>
          <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn wide" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}
