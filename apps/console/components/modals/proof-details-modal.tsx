"use client";

import { FiCheckCircle } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appEvents } from "@/events";
import type { Proof } from "@/lib/types";

function token(baseUnits: number) {
  return (baseUnits / 1_000_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

export function ProofDetailsModal({
  proof,
  onOpenChange,
}: {
  proof: Proof | null;
  onOpenChange(open: boolean): void;
}) {
  function changeOpen(open: boolean) {
    onOpenChange(open);
    appEvents.emit(open ? "modal:opened" : "modal:closed", {
      name: "proof-details",
    });
  }

  return (
    <Dialog open={Boolean(proof)} onOpenChange={changeOpen}>
      {proof && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="modal-symbol modal-symbol--success">
              <FiCheckCircle aria-hidden="true" />
            </div>
            <span className="section-label">VERIFIED PROOF</span>
            <DialogTitle>{proof.deviceId} · #{proof.sequence}</DialogTitle>
            <DialogDescription>
              Signed renewable-energy evidence accepted by the verification policy.
            </DialogDescription>
          </DialogHeader>

          <div className="proof-detail-grid">
            <span>Energy<strong>{proof.energyDeltaWh} Wh</strong></span>
            <span>Average power<strong>{proof.averagePowerW} W</strong></span>
            <span>Samples<strong>{proof.sampleCount}</strong></span>
            <span>Reward<strong>{token(proof.rewardBaseUnits)} MINER</strong></span>
          </div>

          <div className="proof-detail-field">
            <label>SHA-256 digest</label>
            <code>{proof.proofDigest}</code>
          </div>
          <div className="proof-detail-field">
            <label>Observed</label>
            <code>{proof.observedAt}</code>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
