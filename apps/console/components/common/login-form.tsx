"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SESSION_RETURN_TO_PARAM } from "@/constants/session";
import { appEvents } from "@/events";
import { safeReturnTo } from "@/helpers";
import { trackAnalytics } from "@/lib/analytics";

function resolvedReturnTo() {
  const raw = new URL(window.location.href).searchParams.get(
    SESSION_RETURN_TO_PARAM,
  );
  return safeReturnTo(raw, ROUTES.platform);
}

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
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
        const reason = body.error ?? "Sign in failed.";
        setError(reason);
        appEvents.emit("auth:login-failed", { reason });
        await trackAnalytics("auth.login.failed");
        return;
      }

      const returnTo = resolvedReturnTo();
      appEvents.emit("auth:login-succeeded", { returnTo });
      await trackAnalytics("auth.login.succeeded");
      window.location.assign(returnTo);
    } catch (cause) {
      const reason =
        cause instanceof Error
          ? cause.message
          : "Sign in failed.";
      setError(reason);
      appEvents.emit("auth:login-failed", { reason });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="login-form">
      <label>
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
        />
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
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign in"}
        {!loading && <FiArrowRight aria-hidden="true" />}
      </Button>
    </form>
  );
}
