import { createPublicKey, verify as cryptoVerify } from "node:crypto";

const MAX_REQUEST_AGE_SECONDS = 300;

export function assertBootstrapToken(request: Request) {
  const expected = process.env.POWERCHAIN_BOOTSTRAP_TOKEN;
  if (!expected || expected.length < 24) {
    throw new Error("Server bootstrap token is not configured securely.");
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    const error = new Error("Unauthorized bootstrap token.");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
}

export function verifyDeviceSignature(
  publicKeyPem: string,
  request: Request,
  rawBody: string,
) {
  const timestamp = request.headers.get("x-powerchain-timestamp");
  const signature = request.headers.get("x-powerchain-signature");

  if (!timestamp || !signature) return false;

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsedTimestamp) > MAX_REQUEST_AGE_SECONDS) return false;

  try {
    const key = createPublicKey(publicKeyPem);
    const message = Buffer.from(`${timestamp}.${rawBody}`, "utf8");
    return cryptoVerify(null, message, key, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}
