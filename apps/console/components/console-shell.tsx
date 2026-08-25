import type { ReactNode } from "react";
import { DesktopHeader } from "@/components/common/desktop-header";
import { DesktopSidebar } from "@/components/common/desktop-sidebar";

export function ConsoleShell({
  title,
  eyebrow,
  children,
  isSuperadmin = false,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  isSuperadmin?: boolean;
}) {
  return (
    <main className="desktop-shell">
      <DesktopSidebar isSuperadmin={isSuperadmin} />
      <section className="desktop-main">
        <DesktopHeader
          title={title}
          eyebrow={eyebrow}
          isSuperadmin={isSuperadmin}
        />
        <div className="desktop-content">{children}</div>
      </section>
    </main>
  );
}
