import {
  FiActivity,
  FiCpu,
  FiShield,
} from "react-icons/fi";
import { Brand } from "@/components/common/brand";
import { LoginForm } from "@/components/common/login-form";

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <Brand />
        <div className="login-brand-panel__copy">
          <span>RENEWABLE OPERATIONS</span>
          <h1>
            Operate physical energy with verifiable digital controls.
          </h1>
          <p>
            Evidence, policy, approval, wallet authorization and settlement
            stay visible as separate control boundaries.
          </p>
        </div>
        <div className="login-principles">
          <article>
            <FiActivity />
            <span>
              <strong>Physical truth</strong>
              <small>Meter evidence first</small>
            </span>
          </article>
          <article>
            <FiCpu />
            <span>
              <strong>AI prepares</strong>
              <small>No invisible authority</small>
            </span>
          </article>
          <article>
            <FiShield />
            <span>
              <strong>Wallets authorize</strong>
              <small>Keys remain user-controlled</small>
            </span>
          </article>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div>
            <span className="section-label">SECURE CONSOLE</span>
            <h2>Sign in to PowerChain</h2>
            <p>
              Continue to the authenticated operations workspace.
            </p>
          </div>

          <LoginForm />

          <small className="login-security-note">
            Authentication is handled by the PowerChain control plane. Wallet
            private keys are never requested by this form.
          </small>
        </div>
      </section>
    </main>
  );
}
