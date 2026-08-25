"use client";

import { FormEvent, useState } from "react";
import { FiActivity, FiArrowRight, FiCpu, FiShield } from "react-icons/fi";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SESSION_RETURN_TO_PARAM } from "@/constants/session";

function returnTo() {
  const value = new URL(window.location.href).searchParams.get(
    SESSION_RETURN_TO_PARAM,
  );
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : ROUTES.platform;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
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
      if (!response.ok) {
        setError(body.error ?? "Sign in failed.");
        return;
      }

      window.location.assign(returnTo());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <Brand />
        <div className="login-brand-panel__copy">
          <span>RENEWABLE OPERATIONS</span>
          <h1>Operate physical energy with verifiable digital controls.</h1>
          <p>
            Evidence, policy, approval, wallet authorization and settlement stay visible
            as separate control boundaries.
          </p>
        </div>
        <div className="login-principles">
          <article><FiActivity /><span><strong>Physical truth</strong><small>Meter evidence first</small></span></article>
          <article><FiCpu /><span><strong>AI prepares</strong><small>No invisible authority</small></span></article>
          <article><FiShield /><span><strong>Wallets authorize</strong><small>Keys remain user-controlled</small></span></article>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div>
            <span className="section-label">SECURE CONSOLE</span>
            <h2>Sign in to PowerChain</h2>
            <p>Continue to the authenticated operations workspace.</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <label>
              Email
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <FiArrowRight aria-hidden="true" />}
            </Button>
          </form>

          <small className="login-security-note">
            Authentication is handled by the PowerChain control plane. Wallet private keys
            are never requested by this form.
          </small>
        </div>
      </section>
    </main>
  );
}
