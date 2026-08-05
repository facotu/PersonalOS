import { TaskItem } from "@/lib/tasks/types";
import { NoteItem } from "@/lib/notes/types";
import { TimeEntryItem } from "@/lib/time/types";
import { ProjectHealth } from "@/lib/projects/types";

export interface DeadlineItem {
  id: string;
  title: string;
  type: "EVENT" | "TASK" | "PROJECT";
  start_time: string;
  end_time?: string | null;
  statusCategory: "OVERDUE" | "TODAY" | "WITHIN_48H" | "WITHIN_7D";
  project?: { id: string; name: string; color: string | null } | null;
}

export interface CalendarPreviewItem {
  id: string;
  title: string;
  type: "EVENT" | "TASK" | "PROJECT";
  start_time: string;
  end_time?: string | null;
}

export interface DashboardProjectHealthItem {
  id: string;
  name: string;
  status: string;
  health: ProjectHealth;
  progress_pct: number;
  completed_tasks: number;
  active_tasks: number;
  deadline?: string | null;
}

export interface DashboardTimeSummary {
  todayTotalSeconds: number;
  todayBillableSeconds: number;
  weekTotalSeconds: number;
}

export interface DashboardData {
  greeting: string;
  userFullName: string;
  currentDateStr: string;
  focusCount: number;
  upcomingDeadlineCount: number;
  attentionProjectCount: number;

  focusTasks: TaskItem[];
  deadlines: DeadlineItem[];
  projectHealth: DashboardProjectHealthItem[];
  calendarPreview: CalendarPreviewItem[];
  timeSummary: DashboardTimeSummary;
  recentNotes: NoteItem[];
  activeTimer: TimeEntryItem | null;
}
