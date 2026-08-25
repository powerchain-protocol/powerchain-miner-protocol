import Link from "next/link";
import { FiZap } from "react-icons/fi";
import { APP_CONFIG } from "@/config/app";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl px-2 text-inherit no-underline",
        compact && "justify-center px-0",
      )}
      aria-label={APP_CONFIG.name}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#0b3d25] shadow-sm">
        <FiZap size={18} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="grid min-w-0 gap-0.5">
          <strong className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
            PowerChain
          </strong>
          <small className="truncate text-[10px] font-medium uppercase tracking-[0.11em] text-white/50">
            Miner OS
          </small>
        </span>
      )}
    </Link>
  );
}
