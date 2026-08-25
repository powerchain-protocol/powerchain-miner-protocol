import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const Icons = {
  Overview: (p: Props) => <IconBase {...p}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></IconBase>,
  Node: (p: Props) => <IconBase {...p}><rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></IconBase>,
  Bolt: (p: Props) => <IconBase {...p}><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></IconBase>,
  Proof: (p: Props) => <IconBase {...p}><path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></IconBase>,
  Wallet: (p: Props) => <IconBase {...p}><path d="M4 6h14a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V6Z"/><path d="M4 8V6a2 2 0 0 1 2-2h10"/><path d="M15 12h5"/></IconBase>,
  Network: (p: Props) => <IconBase {...p}><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M7 18l5-6 5 6"/></IconBase>,
  Settings: (p: Props) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.4 3h-4.8l-.4 3.1a8 8 0 0 0-1.7 1L5 6.1 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.5-1a8 8 0 0 0 1.7 1l.4 3h4.8l.4-3a8 8 0 0 0 1.7-1l2.5 1 2-3.5-2.1-1.5c.1-.3.1-.7.1-1Z"/></IconBase>,
  Sun: (p: Props) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></IconBase>,
  Plus: (p: Props) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>,
  Copy: (p: Props) => <IconBase {...p}><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></IconBase>,
  Close: (p: Props) => <IconBase {...p}><path d="m6 6 12 12M18 6 6 18"/></IconBase>,
};
