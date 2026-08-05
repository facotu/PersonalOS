import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "PERSONAL OS Automation Engine",
    version: "1.0.0",
    n8nConnected: true,
    hmacEnabled: true,
    replayProtectionEnabled: true,
    timestamp: new Date().toISOString(),
  });
}
