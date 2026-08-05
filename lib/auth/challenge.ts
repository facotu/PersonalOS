import { cookies } from "next/headers";
import crypto from "crypto";

const CHALLENGE_COOKIE_NAME = "passkey_challenge";
const CHALLENGE_TTL_SECONDS = 60; // Short-lived 60s
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "passkey-challenge-signing-secret-key-32b";

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

function verify(signedValue: string): string | null {
  const parts = signedValue.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedHmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
    return payload;
  }
  return null;
}

export async function createAndStoreChallenge(): Promise<string> {
  const rawChallenge = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + CHALLENGE_TTL_SECONDS * 1000;
  const payload = JSON.stringify({ challenge: rawChallenge, expiresAt });
  const signed = sign(payload);

  const cookieStore = cookies();
  cookieStore.set(CHALLENGE_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CHALLENGE_TTL_SECONDS,
    path: "/",
  });

  return rawChallenge;
}

export async function getAndConsumeChallenge(): Promise<string | null> {
  const cookieStore = cookies();
  const cookieVal = cookieStore.get(CHALLENGE_COOKIE_NAME)?.value;

  // Single-use: clear cookie immediately
  cookieStore.delete(CHALLENGE_COOKIE_NAME);

  if (!cookieVal) return null;

  const payloadStr = verify(cookieVal);
  if (!payloadStr) return null;

  try {
    const { challenge, expiresAt } = JSON.parse(payloadStr);
    if (Date.now() > expiresAt) return null; // Expired
    return challenge;
  } catch {
    return null;
  }
}
