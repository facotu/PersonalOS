import { AutomationJobStatus } from "@/lib/automation/types";

export interface IdempotencyCheckResult {
  isDuplicate: boolean;
  jobId?: string;
  existingResult?: any;
  status?: AutomationJobStatus;
}

/**
 * Checks and locks idempotency key in automation_jobs table to guarantee Retry ≠ Duplicate side effect.
 */
export async function checkAndLockIdempotencyKey(
  supabase: any,
  userId: string,
  idempotencyKey: string,
  jobType: string,
  payload: Record<string, any> = {}
): Promise<IdempotencyCheckResult> {
  if (!idempotencyKey) {
    // If no key, create a temporary job record
    const { data: job } = await supabase
      .from("automation_jobs")
      .insert({
        user_id: userId,
        job_type: jobType,
        status: "PROCESSING",
        started_at: new Date().toISOString(),
        payload,
      })
      .select("id")
      .single();

    return { isDuplicate: false, jobId: job?.id };
  }

  // 1. Query Existing Job by idempotency_key
  const { data: existingJob } = await supabase
    .from("automation_jobs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingJob) {
    if (existingJob.status === "COMPLETED") {
      return {
        isDuplicate: true,
        jobId: existingJob.id,
        existingResult: existingJob.result,
        status: "COMPLETED",
      };
    }
    if (existingJob.status === "PROCESSING") {
      return {
        isDuplicate: true,
        jobId: existingJob.id,
        status: "PROCESSING",
      };
    }
  }

  // 2. Lock Key by Inserting New Job Record
  const { data: newJob, error } = await supabase
    .from("automation_jobs")
    .insert({
      user_id: userId,
      job_type: jobType,
      status: "PROCESSING",
      started_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
      payload,
    })
    .select("id")
    .single();

  if (error) {
    // Key collision occurred concurrently
    return { isDuplicate: true, status: "PROCESSING" };
  }

  return { isDuplicate: false, jobId: newJob.id };
}

/**
 * Updates automation_jobs record state upon completion or failure.
 */
export async function updateAutomationJobStatus(
  supabase: any,
  jobId: string,
  status: AutomationJobStatus,
  result: Record<string, any> = {},
  errorMsg: string | null = null
): Promise<void> {
  if (!jobId) return;

  await supabase
    .from("automation_jobs")
    .update({
      status,
      completed_at: new Date().toISOString(),
      result,
      error: errorMsg,
    })
    .eq("id", jobId);
}
