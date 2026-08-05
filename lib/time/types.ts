export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface TimeEntryItem {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: TimerStatus;
  is_billable: boolean;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  task?: {
    id: string;
    title: string;
    project_id: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

export interface TimeFilterOptions {
  startDate?: string;
  endDate?: string;
  project_id?: string;
  task_id?: string;
  is_billable?: boolean;
  search?: string;
}
