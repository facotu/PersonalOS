import { ProjectHealth } from "@/lib/projects/types";

export interface WeeklyAnalyticsPeriod {
  weekStartIso: string;
  weekEndIso: string;
  weekLabel: string; // e.g. "03/08 — 09/08/2026"
  weekNumber: number;
  year: number;
  isCurrentWeek: boolean;
  isFutureWeek: boolean;
}

export interface WeeklyOverviewKPI {
  completedTasks: number;
  completedTasksDiffPct: number | null; // % change vs prev week, null if N/A
  completionRatePct: number | null; // null if denominator = 0
  onTimeRatePct: number | null; // null if denominator = 0
  overdueTasks: number;
  totalTimeSeconds: number;
  totalTimeDiffPct: number | null;
  billableTimeSeconds: number;
  nonBillableTimeSeconds: number;
}

export interface TaskPerformanceData {
  createdCount: number;
  completedCount: number;
  overdueCount: number;
  remainingCount: number;
  statusDistribution: {
    CHUA_LAM: number;
    DANG_LAM: number;
    CHO: number;
    HOAN_THANH: number;
    HUY: number;
  };
  priorityDistribution: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
  };
}

export interface DailyTimeDistribution {
  dayName: string; // T2, T3, T4, T5, T6, T7, CN
  dateStr: string;
  totalSeconds: number;
  billableSeconds: number;
}

export interface ProjectTimeDistribution {
  projectId: string | null;
  projectName: string;
  color: string | null;
  totalSeconds: number;
}

export interface ProjectPerformanceData {
  id: string;
  name: string;
  status: string;
  health: ProjectHealth;
  tasksCreated: number;
  tasksCompleted: number;
  tasksOverdue: number;
  completionRatePct: number;
  timeTrackedSeconds: number;
}

export interface DeadlinePerformanceData {
  onTimeCount: number;
  lateCount: number;
  unfinishedCount: number;
}

export interface RuleBasedInsight {
  id: string;
  type: "INFO" | "WARNING" | "SUCCESS";
  message: string;
}

export interface WeeklyReviewRecord {
  id?: string;
  week_number: number;
  year: number;
  week_start: string;
  week_end: string;
  highlights: string[];
  challenges: string[];
  next_week_priorities: string[];
}

export interface WeeklyAnalyticsData {
  period: WeeklyAnalyticsPeriod;
  overview: WeeklyOverviewKPI;
  taskPerformance: TaskPerformanceData;
  timeAnalysis: {
    totalSeconds: number;
    billableSeconds: number;
    nonBillableSeconds: number;
    byDay: DailyTimeDistribution[];
    byProject: ProjectTimeDistribution[];
    billablePct: number;
  };
  projectPerformance: ProjectPerformanceData[];
  deadlinePerformance: DeadlinePerformanceData;
  insights: RuleBasedInsight[];
  weeklyReview: WeeklyReviewRecord | null;
}
