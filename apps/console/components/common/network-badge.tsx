"use client";

import { FiActivity } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { NETWORK_LABELS } from "@/constants/networks";
import { clientEnv } from "@/env/client";

export function NetworkBadge() {
  return (
    <Badge className="h-9 border-[#d8e4dc] bg-white px-3 text-[#405047] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/75">
      <FiActivity className="text-[#176b3a]" aria-hidden="true" />
      {NETWORK_LABELS[clientEnv.network]}
    </Badge>
  );
}
