export type CalendarEventType = 'Task' | 'Meeting' | 'Personal' | 'Reminder';
export type CalendarViewMode = 'month' | 'week' | 'day';

export type CalendarItemKind = 'event' | 'task' | 'project_deadline';

export interface CalendarEventItem {
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
  event_type: CalendarEventType;
  created_at: string;
  updated_at: string;
}

export interface UnifiedCalendarItem {
  id: string;
  kind: CalendarItemKind;
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  color?: string | null;
  priority?: string | null;
  status?: string | null;
  rawEvent?: CalendarEventItem;
  rawTask?: any;
  rawProject?: any;
}

export interface CalendarFilterOptions {
  viewMode?: CalendarViewMode;
  search?: string;
  showEvents?: boolean;
  showTasks?: boolean;
  showProjects?: boolean;
  eventTypes?: CalendarEventType[];
}
