export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsRecord {
  id?: string;
  user_id: string;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  theme: string;
  week_starts_on: number;
  default_view: string;
  working_hours_start: string;
  working_hours_end: string;
  daily_brief_time: string;
}

export interface NotificationPreferencesRecord {
  id?: string;
  user_id: string;
  deadline_24h: boolean;
  deadline_1h: boolean;
  overdue: boolean;
  daily_brief: boolean;
  weekly_review: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  telegram_enabled: boolean;
  daily_brief_time: string;
  timezone: string;
}

export interface SettingsPageData {
  profile: UserProfile;
  settings: UserSettingsRecord | null;
  notifications: NotificationPreferencesRecord | null;
}
