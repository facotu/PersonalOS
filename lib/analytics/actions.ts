import { createClient } from "@/lib/supabase/client";
import {
  WeeklyAnalyticsData,
  WeeklyAnalyticsPeriod,
  WeeklyReviewRecord,
  RuleBasedInsight,
  ProjectPerformanceData,
  ProjectTimeDistribution,
  DailyTimeDistribution,
} from "@/lib/analytics/types";
import { calculateProjectHealth } from "@/lib/projects/actions";

/**
 * Calculates Week Start (Monday 00:00:00) and Week End (Sunday 23:59:59)
 */
function getWeekRange(date: Date) {
  const start = new Date(date);
  let dayOfWeek = start.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;
  start.setDate(start.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // ISO Week Number
  const target = new Date(start.valueOf());
  const dayNr = (start.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);

  return { start, end, weekNumber, year: start.getFullYear() };
}

export async function getWeeklyAnalytics(targetDateIso?: string): Promise<WeeklyAnalyticsData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const targetDate = targetDateIso ? new Date(targetDateIso) : new Date();
  const now = new Date();

  // Current Week Range
  const { start: weekStart, end: weekEnd, weekNumber, year } = getWeekRange(targetDate);
  const { start: prevWeekStart, end: prevWeekEnd } = getWeekRange(
    new Date(weekStart.getTime() - 7 * 86400000)
  );

  const isCurrentWeek = now >= weekStart && now <= weekEnd;
  const isFutureWeek = weekStart > now;

  const period: WeeklyAnalyticsPeriod = {
    weekStartIso: weekStart.toISOString(),
    weekEndIso: weekEnd.toISOString(),
    weekLabel: `${weekStart.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} — ${weekEnd.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
    weekNumber,
    year,
    isCurrentWeek,
    isFutureWeek,
  };

  // Return empty structure for future weeks without fake data
  if (isFutureWeek) {
    return {
      period,
      overview: {
        completedTasks: 0,
        completedTasksDiffPct: null,
        completionRatePct: null,
        onTimeRatePct: null,
        overdueTasks: 0,
        totalTimeSeconds: 0,
        totalTimeDiffPct: null,
        billableTimeSeconds: 0,
        nonBillableTimeSeconds: 0,
      },
      taskPerformance: {
        createdCount: 0,
        completedCount: 0,
        overdueCount: 0,
        remainingCount: 0,
        statusDistribution: { CHUA_LAM: 0, DANG_LAM: 0, CHO: 0, HOAN_THANH: 0, HUY: 0 },
        priorityDistribution: { P0: 0, P1: 0, P2: 0, P3: 0 },
      },
      timeAnalysis: {
        totalSeconds: 0,
        billableSeconds: 0,
        nonBillableSeconds: 0,
        byDay: [],
        byProject: [],
        billablePct: 0,
      },
      projectPerformance: [],
      deadlinePerformance: { onTimeCount: 0, lateCount: 0, unfinishedCount: 0 },
      insights: [
        { id: "future", type: "INFO", message: "Tuần này ở tương lai. Chưa có dữ liệu ghi nhận." },
      ],
      weeklyReview: null,
    };
  }

  // 1. Fetch Tasks for Current Week & Prev Week
  const { data: currentTasks } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name, color)")
    .eq("user_id", user.id);

  const { data: prevTimeEntries } = await supabase
    .from("time_entries")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .gte("started_at", prevWeekStart.toISOString())
    .lte("started_at", prevWeekEnd.toISOString());

  const allTasks = currentTasks || [];

  // Filter Tasks created/due in current week
  const createdInWeek = allTasks.filter((t) => {
    const cDate = new Date(t.created_at);
    return cDate >= weekStart && cDate <= weekEnd;
  });

  const completedInWeek = allTasks.filter((t) => {
    if (t.status !== "HOAN_THANH") return false;
    const uDate = new Date(t.updated_at);
    return uDate >= weekStart && uDate <= weekEnd;
  });

  const dueInWeek = allTasks.filter((t) => {
    if (!t.due_date) return false;
    const dDate = new Date(t.due_date);
    return dDate >= weekStart && dDate <= weekEnd;
  });

  const overdueTasks = allTasks.filter((t) => {
    if (t.status === "HOAN_THANH" || t.status === "HUY" || !t.due_date) return false;
    return new Date(t.due_date) < weekEnd;
  });

  // KPI Calculations
  const completedCount = completedInWeek.length;

  // Completion Rate: Completed / (Due or Created in week) * 100
  const totalTasksScope = dueInWeek.length + createdInWeek.filter((t) => !t.due_date).length;
  const completionRatePct =
    totalTasksScope > 0 ? Math.round((completedCount / totalTasksScope) * 100) : null;

  // On-Time Completion Rate
  const completedWithDue = completedInWeek.filter((t) => t.due_date);
  const onTimeCompleted = completedWithDue.filter(
    (t) => new Date(t.updated_at) <= new Date(t.due_date!)
  );

  const onTimeRatePct =
    completedWithDue.length > 0
      ? Math.round((onTimeCompleted.length / completedWithDue.length) * 100)
      : null;

  // Task Distributions
  const statusDistribution = {
    CHUA_LAM: allTasks.filter((t) => t.status === "CHUA_LAM").length,
    DANG_LAM: allTasks.filter((t) => t.status === "DANG_LAM").length,
    CHO: allTasks.filter((t) => t.status === "CHO").length,
    HOAN_THANH: allTasks.filter((t) => t.status === "HOAN_THANH").length,
    HUY: allTasks.filter((t) => t.status === "HUY").length,
  };

  const priorityDistribution = {
    P0: allTasks.filter((t) => t.priority === "P0").length,
    P1: allTasks.filter((t) => t.priority === "P1").length,
    P2: allTasks.filter((t) => t.priority === "P2").length,
    P3: allTasks.filter((t) => t.priority === "P3").length,
  };

  // 2. Time Analysis (time_entries)
  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("*, project:projects(id, name, color)")
    .eq("user_id", user.id)
    .gte("started_at", weekStart.toISOString())
    .lte("started_at", weekEnd.toISOString());

  const entries = timeEntries || [];
  let totalTimeSeconds = 0;
  let billableTimeSeconds = 0;

  // Daily Time Distribution (T2 -> CN)
  const byDay: DailyTimeDistribution[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dayIso = d.toISOString().substring(0, 10);
    const dayName = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i];

    const dayEntries = entries.filter(
      (e) => e.started_at.substring(0, 10) === dayIso
    );
    const dayTotal = dayEntries.reduce((acc, e) => acc + e.duration_seconds, 0);
    const dayBillable = dayEntries
      .filter((e) => e.is_billable)
      .reduce((acc, e) => acc + e.duration_seconds, 0);

    byDay.push({
      dayName,
      dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
      totalSeconds: dayTotal,
      billableSeconds: dayBillable,
    });
  }

  // Project Time Distribution
  const projectTimeMap = new Map<string, { name: string; color: string | null; seconds: number }>();
  entries.forEach((e) => {
    totalTimeSeconds += e.duration_seconds;
    if (e.is_billable) billableTimeSeconds += e.duration_seconds;

    const projKey = e.project_id || "unassigned";
    const projName = e.project?.name || "Khác";
    const projColor = e.project?.color || null;

    const existing = projectTimeMap.get(projKey) || { name: projName, color: projColor, seconds: 0 };
    existing.seconds += e.duration_seconds;
    projectTimeMap.set(projKey, existing);
  });

  const nonBillableTimeSeconds = Math.max(0, totalTimeSeconds - billableTimeSeconds);
  const billablePct =
    totalTimeSeconds > 0 ? Math.round((billableTimeSeconds / totalTimeSeconds) * 100) : 0;

  const sortedProjTimes = Array.from(projectTimeMap.entries()).sort(
    (a, b) => b[1].seconds - a[1].seconds
  );

  const byProject: ProjectTimeDistribution[] = sortedProjTimes.slice(0, 5).map(([id, item]) => ({
    projectId: id === "unassigned" ? null : id,
    projectName: item.name,
    color: item.color,
    totalSeconds: item.seconds,
  }));

  // Add "Khác" if more than 5 projects
  if (sortedProjTimes.length > 5) {
    const otherSeconds = sortedProjTimes.slice(5).reduce((acc, [, item]) => acc + item.seconds, 0);
    byProject.push({
      projectId: null,
      projectName: "Khác",
      color: "#94a3b8",
      totalSeconds: otherSeconds,
    });
  }

  // 3. Project Performance (Phase 5 Health Logic)
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, tasks:tasks(*)")
    .eq("user_id", user.id)
    .eq("status", "Active");

  const projectPerformance: ProjectPerformanceData[] = (projectsData || []).map((p: any) => {
    const tasks = p.tasks || [];
    const pActive = tasks.filter((t: any) => t.status !== "HOAN_THANH" && t.status !== "HUY");
    const pCompleted = tasks.filter((t: any) => t.status === "HOAN_THANH");
    const pOverdue = pActive.filter((t: any) => t.due_date && new Date(t.due_date) < weekEnd);

    const progressPct =
      tasks.length > 0 ? Math.round((pCompleted.length / tasks.length) * 100) : 0;

    const health = calculateProjectHealth(p.deadline, progressPct, pActive);

    const pTrackedSecs = entries
      .filter((e) => e.project_id === p.id)
      .reduce((acc, e) => acc + e.duration_seconds, 0);

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      health,
      tasksCreated: tasks.length,
      tasksCompleted: pCompleted.length,
      tasksOverdue: pOverdue.length,
      completionRatePct: progressPct,
      timeTrackedSeconds: pTrackedSecs,
    };
  });

  // 4. Week-over-Week Comparisons
  const prevTotalSecs = (prevTimeEntries || []).reduce((acc, e) => acc + e.duration_seconds, 0);
  const totalTimeDiffPct =
    prevTotalSecs > 0
      ? Math.round(((totalTimeSeconds - prevTotalSecs) / prevTotalSecs) * 100)
      : null;

  // 5. Rule-Based Insights (NO AI!)
  const insights: RuleBasedInsight[] = [];

  if (totalTimeDiffPct !== null) {
    if (totalTimeDiffPct > 0) {
      insights.push({
        id: "time_inc",
        type: "SUCCESS",
        message: `Thời gian làm việc tuần này tăng ${totalTimeDiffPct}% so với tuần trước.`,
      });
    } else if (totalTimeDiffPct < 0) {
      insights.push({
        id: "time_dec",
        type: "INFO",
        message: `Thời gian làm việc tuần này giảm ${Math.abs(totalTimeDiffPct)}% so với tuần trước.`,
      });
    }
  }

  if (overdueTasks.length > 0) {
    insights.push({
      id: "overdue",
      type: "WARNING",
      message: `Có ${overdueTasks.length} công việc đã quá hạn cần ưu tiên xử lý.`,
    });
  }

  if (byProject.length > 0 && totalTimeSeconds > 0) {
    const topProj = byProject[0];
    const topPct = Math.round((topProj.totalSeconds / totalTimeSeconds) * 100);
    insights.push({
      id: "top_proj",
      type: "INFO",
      message: `Dự án "${topProj.projectName}" chiếm ${topPct}% tổng thời gian làm việc tuần này.`,
    });
  }

  if (onTimeRatePct !== null && onTimeRatePct >= 80) {
    insights.push({
      id: "ontime",
      type: "SUCCESS",
      message: `Tỷ lệ hoàn thành đúng hạn đạt ${onTimeRatePct}% (xuất sắc).`,
    });
  }

  // 6. Fetch Weekly Review Record (existing table weekly_reviews)
  const { data: reviewData } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("week_number", weekNumber)
    .maybeSingle();

  const weeklyReview: WeeklyReviewRecord | null = reviewData
    ? {
        id: reviewData.id,
        week_number: reviewData.week_number,
        year: reviewData.year,
        week_start: reviewData.week_start,
        week_end: reviewData.week_end,
        highlights: reviewData.highlights || [],
        challenges: reviewData.at_risk_projects || [],
        next_week_priorities: reviewData.next_week_priorities || [],
      }
    : null;

  return {
    period,
    overview: {
      completedTasks: completedCount,
      completedTasksDiffPct: null,
      completionRatePct,
      onTimeRatePct,
      overdueTasks: overdueTasks.length,
      totalTimeSeconds,
      totalTimeDiffPct,
      billableTimeSeconds,
      nonBillableTimeSeconds,
    },
    taskPerformance: {
      createdCount: createdInWeek.length,
      completedCount,
      overdueCount: overdueTasks.length,
      remainingCount: statusDistribution.CHUA_LAM + statusDistribution.DANG_LAM + statusDistribution.CHO,
      statusDistribution,
      priorityDistribution,
    },
    timeAnalysis: {
      totalSeconds: totalTimeSeconds,
      billableSeconds: billableTimeSeconds,
      nonBillableSeconds: nonBillableTimeSeconds,
      byDay,
      byProject,
      billablePct,
    },
    projectPerformance: projectPerformance.slice(0, 5),
    deadlinePerformance: {
      onTimeCount: onTimeCompleted.length,
      lateCount: completedWithDue.length - onTimeCompleted.length,
      unfinishedCount: overdueTasks.length,
    },
    insights,
    weeklyReview,
  };
}

export async function saveWeeklyReviewAction(payload: {
  week_number: number;
  year: number;
  week_start: string;
  week_end: string;
  highlights: string[];
  challenges: string[];
  next_week_priorities: string[];
}): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("weekly_reviews")
    .upsert(
      {
        user_id: user.id,
        week_number: payload.week_number,
        year: payload.year,
        week_start: payload.week_start,
        week_end: payload.week_end,
        highlights: payload.highlights,
        at_risk_projects: payload.challenges,
        next_week_priorities: payload.next_week_priorities,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,year,week_number" }
    );

  if (error) {
    console.error("Error saving weekly review:", error);
    throw new Error("Không thể lưu Tổng Kết Tuần.");
  }
}
