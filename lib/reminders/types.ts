export type NotificationType =
  | 'DEADLINE_24H'
  | 'DEADLINE_1H'
  | 'OVERDUE'
  | 'DAILY_BRIEF'
  | 'WEEKLY_REVIEW'
  | 'SYSTEM';

export type ReminderSourceType = 'TASK' | 'PROJECT' | 'CALENDAR_EVENT';

export interface NotificationMetadata {
  source_type?: ReminderSourceType;
  source_id?: string;
  reminder_type?: string; // e.g. "24h", "2h", "10m", "overdue"
  snoozed_until?: string | null;
  dismissed?: boolean;
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduled_at: string | null;
  sent_at: string | null;
  read_at: string | null;
  is_read: boolean;
  link_url: string | null;
  metadata: NotificationMetadata;
  created_at: string;
}

export interface NotificationFilterOptions {
  status?: 'all' | 'unread' | 'read';
  source_type?: ReminderSourceType;
  limit?: number;
  page?: number;
}

export interface NotificationPreferences {
  user_id: string;
  deadline_24h: boolean;
  deadline_1h: boolean;
  overdue: boolean;
  daily_brief: boolean;
  weekly_review: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string; // "22:00"
  quiet_hours_end?: string; // "07:00"
}
