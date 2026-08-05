import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { verifyWebhookSignature } from "@/lib/automation/security";
import { checkAndLockIdempotencyKey, updateAutomationJobStatus } from "@/lib/automation/idempotency";
import { AutomationService } from "@/lib/automation/service";
import { AutomationEnvelopePayload } from "@/lib/automation/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Verify HMAC SHA-256 Signature & Timestamp Replay Tolerance
    const verification = await verifyWebhookSignature(req, rawBody);
    if (!verification.isValid) {
      if (verification.error === "AUTOMATION_NOT_CONFIGURED") {
        return NextResponse.json(
          { success: false, error: "Automation service chưa được cấu hình" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: verification.error || "INVALID_WEBHOOK_SIGNATURE" },
        { status: 401 }
      );
    }

    // 2. Parse Envelope Payload
    let payload: AutomationEnvelopePayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "MALFORMED_JSON_PAYLOAD" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Target User ID (Authenticated session or verified envelope user_id)
    const userId = user?.id || payload.user_id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED_USER_ID" },
        { status: 403 }
      );
    }

    // 3. Enforce Idempotency Key Lock (Retry ≠ Duplicate side effect)
    const idempotencyKey = verification.idempotencyKey || payload.idempotency_key || payload.request_id;
    const lockResult = await checkAndLockIdempotencyKey(
      supabase,
      userId,
      idempotencyKey,
      payload.event || "UNKNOWN_JOB",
      payload
    );

    if (lockResult.isDuplicate) {
      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          request_id: payload.request_id,
          job_id: lockResult.jobId,
          status: lockResult.status || "COMPLETED",
          result: lockResult.existingResult || {},
        },
        { status: 200 }
      );
    }

    const jobId = lockResult.jobId || "";

    // 4. Process Automation Event
    try {
      const result = await AutomationService.processEvent(payload, userId);

      // Update Automation Job Status to COMPLETED
      await updateAutomationJobStatus(supabase, jobId, "COMPLETED", result, null);

      return NextResponse.json(
        {
          success: true,
          request_id: payload.request_id,
          job_id: jobId,
          status: "accepted",
          data: result,
        },
        { status: 200 }
      );
    } catch (err: any) {
      await updateAutomationJobStatus(supabase, jobId, "FAILED", {}, err.message);
      return NextResponse.json(
        { success: false, error: "AUTOMATION_EXECUTION_ERROR" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Automation Webhook Error:", err);
    return NextResponse.json(
      { success: false, error: "INTERNAL_AUTOMATION_ERROR" },
      { status: 500 }
    );
  }
}
