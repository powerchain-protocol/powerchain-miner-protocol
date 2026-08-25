"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PWA() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !prompt) return null;

  return (
    <aside className="install-prompt" aria-label="Install PowerChain">
      <div>
        <strong>Install Renewable Miner OS</strong>
        <span>Keep node status and rewards one tap away.</span>
      </div>
      <div className="install-prompt__actions">
        <button
          className="button button--ghost"
          type="button"
          onClick={() => setVisible(false)}
        >
          Not now
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            setVisible(false);
            setPrompt(null);
          }}
        >
          Install
        </button>
      </div>
    </aside>
  );
}
