import crypto from "crypto";
import { NextRequest } from "next/server";
import { WebhookVerificationResult } from "@/lib/automation/types";

const TIME_TOLERANCE_SECONDS = 300; // 5 minutes max replay window

export function getWebhookSecret(): string {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("N8N_WEBHOOK_SECRET chưa được cấu hình trong môi trường.");
  }
  return secret;
}

export function computeHmacSignature(rawBody: string, timestamp: string, secret: string): string {
  const canonicalString = `${timestamp}.${rawBody}`;
  return crypto.createHmac("sha256", secret).update(canonicalString).digest("hex");
}

/**
 * Verifies Webhook HMAC SHA-256 signature and timestamp replay tolerance.
 * Enforces strict environment variable validation (Zero fallback default secret).
 */
export async function verifyWebhookSignature(
  req: NextRequest,
  rawBody: string
): Promise<WebhookVerificationResult> {
  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (err: any) {
    return { isValid: false, error: "AUTOMATION_NOT_CONFIGURED" };
  }

  const timestamp = req.headers.get("X-PersonalOS-Timestamp") || req.headers.get("x-personalos-timestamp");
  const signature = req.headers.get("X-PersonalOS-Signature") || req.headers.get("x-personalos-signature");
  const idempotencyKey = req.headers.get("X-PersonalOS-Idempotency-Key") || req.headers.get("x-personalos-idempotency-key");

  if (!timestamp || !signature) {
    return { isValid: false, error: "MISSING_SIGNATURE_HEADERS" };
  }

  // 1. Validate Timestamp Replay Tolerance (5 minutes window)
  const reqTime = parseInt(timestamp, 10);
  const nowTime = Math.floor(Date.now() / 1000);

  if (isNaN(reqTime) || Math.abs(nowTime - reqTime) > TIME_TOLERANCE_SECONDS) {
    return { isValid: false, error: "TIMESTAMP_OUT_OF_TOLERANCE" };
  }

  // 2. Compute expected HMAC SHA-256 Signature
  const expectedSignature = computeHmacSignature(rawBody, timestamp, secret);

  // Timing-safe buffer comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { isValid: false, error: "INVALID_SIGNATURE" };
  }

  return {
    isValid: true,
    timestamp,
    idempotencyKey: idempotencyKey || undefined,
  };
}
