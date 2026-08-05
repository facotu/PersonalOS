import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  // Generate a cryptographically secure random 32-byte challenge
  const challenge = crypto.randomBytes(32).toString("base64");

  return NextResponse.json({
    challenge,
    rpId: process.env.NODE_ENV === "development" ? "localhost" : undefined,
  });
}
