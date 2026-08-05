export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language?: string;
          timezone?: string;
          date_format?: string;
          time_format?: string;
          theme?: string;
          week_starts_on?: number;
          default_view?: string;
          working_hours_start?: string;
          working_hours_end?: string;
          daily_brief_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
      notification_preferences: {
        Row: {
          id: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deadline_24h?: boolean;
          deadline_1h?: boolean;
          overdue?: boolean;
          daily_brief?: boolean;
          weekly_review?: boolean;
          email_enabled?: boolean;
          push_enabled?: boolean;
          telegram_enabled?: boolean;
          daily_brief_time?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal: string | null;
          description: string | null;
          status: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
          priority: 'P0' | 'P1' | 'P2' | 'P3';
          start_date: string | null;
          deadline: string | null;
          progress_pct: number;
          color: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          goal?: string | null;
          description?: string | null;
          status?: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
          priority?: 'P0' | 'P1' | 'P2' | 'P3';
          start_date?: string | null;
          deadline?: string | null;
          progress_pct?: number;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          status: 'CHUA_LAM' | 'DANG_LAM' | 'CHO' | 'HOAN_THANH' | 'HUY';
          priority: 'P0' | 'P1' | 'P2' | 'P3';
          start_date: string | null;
          due_date: string | null;
          completion_pct: number;
          estimated_hours: number;
          actual_hours: number;
          energy_level: 'HIGH' | 'MEDIUM' | 'LOW';
          sort_order: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          status?: 'CHUA_LAM' | 'DANG_LAM' | 'CHO' | 'HOAN_THANH' | 'HUY';
          priority?: 'P0' | 'P1' | 'P2' | 'P3';
          start_date?: string | null;
          due_date?: string | null;
          completion_pct?: number;
          estimated_hours?: number;
          actual_hours?: number;
          energy_level?: 'HIGH' | 'MEDIUM' | 'LOW';
          sort_order?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      task_tags: {
        Row: {
          task_id: string;
          tag_id: string;
        };
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: {
          task_id?: string;
          tag_id?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          title: string;
          content: Json;
          ai_summary: string | null;
          ai_action_items: Json;
          ai_decisions: Json;
          ai_risks: Json;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          title: string;
          content?: Json;
          ai_summary?: string | null;
          ai_action_items?: Json;
          ai_decisions?: Json;
          ai_risks?: Json;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      time_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          project_id: string | null;
          started_at: string;
          ended_at: string | null;
          status: 'RUNNING' | 'COMPLETED' | 'CANCELLED';
          duration: number;
          type: 'TapTrung' | 'Hop' | 'HanhChinh' | 'Nghi' | 'Khac';
          focus_score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          project_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          status?: 'RUNNING' | 'COMPLETED' | 'CANCELLED';
          duration?: number;
          type?: 'TapTrung' | 'Hop' | 'HanhChinh' | 'Nghi' | 'Khac';
          focus_score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['time_sessions']['Insert']>;
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          is_all_day: boolean;
          location: string | null;
          event_type: 'Task' | 'Meeting' | 'Personal' | 'Reminder';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          is_all_day?: boolean;
          location?: string | null;
          event_type?: 'Task' | 'Meeting' | 'Personal' | 'Reminder';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'DEADLINE_24H' | 'DEADLINE_1H' | 'OVERDUE' | 'DAILY_BRIEF' | 'WEEKLY_REVIEW' | 'SYSTEM';
          title: string;
          message: string;
          scheduled_at: string | null;
          sent_at: string | null;
          read_at: string | null;
          is_read: boolean;
          link_url: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'DEADLINE_24H' | 'DEADLINE_1H' | 'OVERDUE' | 'DAILY_BRIEF' | 'WEEKLY_REVIEW' | 'SYSTEM';
          title: string;
          message: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          read_at?: string | null;
          is_read?: boolean;
          link_url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_number: number;
          year: number;
          week_start: string;
          week_end: string;
          completed_tasks_count: number;
          overdue_tasks_count: number;
          total_hours_worked: number;
          focus_hours: number;
          avg_focus_score: number;
          performance_score: number;
          highlights: string[] | null;
          at_risk_projects: string[] | null;
          ai_recommendations: string | null;
          next_week_priorities: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_number: number;
          year: number;
          week_start: string;
          week_end: string;
          completed_tasks_count?: number;
          overdue_tasks_count?: number;
          total_hours_worked?: number;
          focus_hours?: number;
          avg_focus_score?: number;
          performance_score?: number;
          highlights?: string[] | null;
          at_risk_projects?: string[] | null;
          ai_recommendations?: string | null;
          next_week_priorities?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_reviews']['Insert']>;
      };
      automation_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_type: string;
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
          started_at: string | null;
          completed_at: string | null;
          error: string | null;
          payload: Json;
          result: Json;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_type: string;
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
          started_at?: string | null;
          completed_at?: string | null;
          error?: string | null;
          payload?: Json;
          result?: Json;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['automation_jobs']['Insert']>;
      };
      ai_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          model: string;
          operation: 'summarizeNote' | 'extractActions' | 'analyzeRisk' | 'generateDailyBrief' | 'generateWeeklyReview';
          input_tokens: number;
          output_tokens: number;
          estimated_cost: number;
          latency: number;
          status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: string;
          model: string;
          operation: 'summarizeNote' | 'extractActions' | 'analyzeRisk' | 'generateDailyBrief' | 'generateWeeklyReview';
          input_tokens?: number;
          output_tokens?: number;
          estimated_cost?: number;
          latency?: number;
          status?: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_usage_logs']['Insert']>;
      };
      attachments: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          note_id: string | null;
          file_name: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          note_id?: string | null;
          file_name: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['attachments']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
      };
      user_passkeys: {
        Row: {
          id: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter: number;
          transports: string[] | null;
          device_name: string | null;
          backed_up: boolean;
          created_at: string;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter?: number;
          transports?: string[] | null;
          device_name?: string | null;
          backed_up?: boolean;
          created_at?: string;
          last_used_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_passkeys']['Insert']>;
      };
    };
  };
}
