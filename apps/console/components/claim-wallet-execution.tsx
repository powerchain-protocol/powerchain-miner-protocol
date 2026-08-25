"use client";

import { Buffer } from "buffer";
import { useState } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_2022_PROGRAM_PUBLIC_KEY,
} from "@powerchain-protocol/miner/solana";

type Prepared = {
  claimId: string;
  amountBaseUnits: string;
  destinationTokenAccountExists: boolean;
  instruction: {
    programId: string;
    dataBase64: string;
    accounts: Array<{
      name: string;
      pubkey: string;
      signer: boolean;
      writable: boolean;
    }>;
  };
  accounts: {
    owner: string;
    minerMint: string;
    destination: string;
  };
};

type WalletProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey?: PublicKey } | void>;
  signAndSendTransaction: (
    transaction: Transaction,
  ) => Promise<{ signature: string } | string>;
};

declare global {
  interface Window {
    solana?: WalletProvider;
    phantom?: { solana?: WalletProvider };
    solflare?: WalletProvider;
    backpack?: { solana?: WalletProvider };
  }
}

function walletProvider(): WalletProvider | null {
  return (
    window.phantom?.solana ??
    window.backpack?.solana ??
    window.solflare ??
    window.solana ??
    null
  );
}

function bytesFromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function jsonOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string" ? body.error : `HTTP ${response.status}`,
    );
  }
  return body;
}

export function ClaimWalletExecution({
  claimId,
  onDoneHref,
}: {
  claimId: string;
  onDoneHref: string;
}) {
  const [state, setState] = useState<
    "idle" | "preparing" | "signing" | "confirming" | "done"
  >("idle");
  const [message, setMessage] = useState<string>("");

  async function execute() {
    setMessage("");

    try {
      setState("preparing");
      const preparedBody = await jsonOrThrow(
        await fetch(`/api/console/reward-claims/${claimId}/prepare`, {
          method: "POST",
          headers: { "content-type": "application/json" },
        }),
      );
      const prepared = preparedBody.prepared as Prepared;

      const provider = walletProvider();
      if (!provider) {
        throw new Error(
          "No compatible Solana wallet was detected. Use Phantom, Solflare or Backpack.",
        );
      }

      const connected = await provider.connect();
      const connectedPublicKey =
        connected && typeof connected === "object"
          ? connected.publicKey
          : undefined;
      const publicKey =
        provider.publicKey ??
        connectedPublicKey;

      if (!publicKey) {
        throw new Error("Wallet did not expose a connected public key.");
      }
      if (publicKey.toBase58() !== prepared.accounts.owner) {
        throw new Error(
          `Connect the reward owner wallet ${prepared.accounts.owner}.`,
        );
      }

      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
      if (!rpcUrl) {
        throw new Error(
          "NEXT_PUBLIC_SOLANA_RPC_URL is not configured for wallet submission.",
        );
      }

      const connection = new Connection(rpcUrl, "confirmed");
      const transaction = new Transaction();

      if (!prepared.destinationTokenAccountExists) {
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction({
            payer: publicKey,
            associatedToken: new PublicKey(prepared.accounts.destination),
            owner: publicKey,
            mint: new PublicKey(prepared.accounts.minerMint),
            tokenProgram: TOKEN_2022_PROGRAM_PUBLIC_KEY,
          }),
        );
      }

      transaction.add(
        new TransactionInstruction({
          programId: new PublicKey(prepared.instruction.programId),
          keys: prepared.instruction.accounts.map((account) => ({
            pubkey: new PublicKey(account.pubkey),
            isSigner: account.signer,
            isWritable: account.writable,
          })),
          data: Buffer.from(bytesFromBase64(prepared.instruction.dataBase64)),
        }),
      );

      const latest = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = latest.blockhash;
      transaction.feePayer = publicKey;

      setState("signing");
      const sendResult = await provider.signAndSendTransaction(transaction);
      const signature =
        typeof sendResult === "string" ? sendResult : sendResult.signature;

      if (!signature) {
        throw new Error("Wallet did not return a Solana transaction signature.");
      }

      setState("confirming");
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
      );
      if (confirmation.value.err) {
        throw new Error(
          `Solana transaction failed: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      await jsonOrThrow(
        await fetch(`/api/console/reward-claims/${claimId}/settled`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ signature }),
        }),
      );

      setState("done");
      setMessage(`Confirmed ${signature.slice(0, 16)}…`);
      window.location.assign(onDoneHref);
    } catch (error) {
      setState("idle");
      setMessage((error as Error).message);
    }
  }

  return (
    <div className="claim-wallet-execution">
      <button
        type="button"
        onClick={execute}
        disabled={state !== "idle"}
      >
        {state === "idle" && "Claim on Solana"}
        {state === "preparing" && "Preparing…"}
        {state === "signing" && "Approve in wallet…"}
        {state === "confirming" && "Confirming…"}
        {state === "done" && "Confirmed"}
      </button>
      {message && <small>{message}</small>}
    </div>
  );
}
