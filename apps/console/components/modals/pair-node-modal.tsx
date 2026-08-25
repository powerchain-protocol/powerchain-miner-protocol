"use client";

import { useState } from "react";
import { FiCheck, FiCopy, FiCpu } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appEvents } from "@/events";

export function PairNodeModal({
  open,
  onOpenChange,
  installCommand,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  installCommand: string;
}) {
  const [copied, setCopied] = useState(false);

  function changeOpen(nextOpen: boolean) {
    onOpenChange(nextOpen);
    appEvents.emit(nextOpen ? "modal:opened" : "modal:closed", {
      name: "pair-node",
    });
  }

  async function copy() {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="modal-symbol"><FiCpu aria-hidden="true" /></div>
          <span className="section-label">PAIR HARDWARE</span>
          <DialogTitle>Connect a Raspberry Pi node</DialogTitle>
          <DialogDescription>
            Flash Raspberry Pi OS Lite 64-bit, configure the physical meter source, then
            enroll the device. The Ed25519 identity is generated and retained locally.
          </DialogDescription>
        </DialogHeader>

        <div className="modal-command">
          <code>{installCommand}</code>
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="modal-steps">
          <article><b>01</b><span><strong>Install</strong><small>Raspberry Pi OS Lite 64-bit</small></span></article>
          <article><b>02</b><span><strong>Meter</strong><small>Modbus TCP or HTTP JSON</small></span></article>
          <article><b>03</b><span><strong>Enroll</strong><small>Local Ed25519 device identity</small></span></article>
        </div>

        <Button className="w-full" onClick={() => changeOpen(false)}>Done</Button>
      </DialogContent>
    </Dialog>
  );
}
