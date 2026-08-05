export type AutomationEvent =
  | "reminders.evaluate"
  | "digest.daily"
  | "task.created"
  | "task.completed"
  | "task.overdue"
  | "project.created"
  | "project.deadline_approaching"
  | "calendar.event_starting"
  | "weekly.review_due"
  | "weekly.analytics_ready"
  | "export.requested";

export type AutomationJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AutomationEnvelopePayload {
  event: AutomationEvent;
  event_id: string;
  occurred_at: string;
  user_id: string;
  source?: {
    type: "task" | "project" | "calendar" | "analytics" | "export";
    id: string;
  };
  data?: Record<string, any>;
  request_id: string;
  idempotency_key: string;
}

export interface AutomationJobRecord {
  id: string;
  user_id: string;
  job_type: string;
  status: AutomationJobStatus;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  payload: Record<string, any>;
  result: Record<string, any>;
  idempotency_key: string | null;
  created_at: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  timestamp?: string;
  idempotencyKey?: string;
}
