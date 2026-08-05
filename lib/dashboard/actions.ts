import { createClient } from "@/lib/supabase/client";
import { DashboardData, DeadlineItem, CalendarPreviewItem, DashboardProjectHealthItem } from "@/lib/dashboard/types";
import { calculateProjectHealth } from "@/lib/projects/actions";
import { fetchCalendarItems } from "@/lib/calendar/actions";

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  // 1. Fetch Profile for Greeting
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userFullName = profile?.full_name || user.email?.split("@")[0] || "Anh/Chị";

  const hour = new Date().getHours();
  let greeting = "Chào buổi sáng";
  if (hour >= 12 && hour < 18) greeting = "Chào buổi chiều";
  else if (hour >= 18) greeting = "Chào buổi tối";

  const currentDateStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // 2. Fetch Today's Focus Tasks (Max 5)
  const { data: tasksData } = await supabase
    .from("tasks")
    .select(`
      *,
      project:projects(id, name, color),
      tags:task_tags(tag:tags(id, name, color))
    `)
    .eq("user_id", user.id)
    .neq("status", "HOAN_THANH")
    .neq("status", "HUY")
    .order("priority", { ascending: true }) // P0 -> P1 -> P2 -> P3
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(5);

  const focusTasks = (tasksData || []).map((t: any) => ({
    ...t,
    tags: t.tags?.map((item: any) => item.tag) || [],
  }));

  // 3. Fetch Calendar Unified Deadlines & Events (Phase 6 Integration)
  const now = new Date();
  const start7DaysAgo = new Date(now.getTime() - 7 * 86400000);
  const end7DaysAhead = new Date(now.getTime() + 7 * 86400000);

  const calendarItems = await fetchCalendarItems(
    start7DaysAgo.toISOString(),
    end7DaysAhead.toISOString()
  );

  const nowTime = now.getTime();
  const todayStr = now.toISOString().substring(0, 10);
  const in48hTime = nowTime + 48 * 3600 * 1000;

  const deadlines: DeadlineItem[] = [];
  const calendarPreview: CalendarPreviewItem[] = [];

  calendarItems.forEach((item) => {
    const itemDate = new Date(item.start_time);
    const itemTime = itemDate.getTime();
    const itemDayStr = item.start_time.substring(0, 10);

    // Calendar Preview for TODAY
    if (itemDayStr === todayStr) {
      calendarPreview.push({
        id: item.id,
        title: item.title,
        type: item.type,
        start_time: item.start_time,
        end_time: item.end_time,
      });
    }

    // Deadline Radar categorization
    let category: "OVERDUE" | "TODAY" | "WITHIN_48H" | "WITHIN_7D";
    if (itemTime < nowTime && itemDayStr !== todayStr) {
      category = "OVERDUE";
    } else if (itemDayStr === todayStr) {
      category = "TODAY";
    } else if (itemTime <= in48hTime) {
      category = "WITHIN_48H";
    } else {
      category = "WITHIN_7D";
    }

    deadlines.push({
      id: item.id,
      title: item.title,
      type: item.type,
      start_time: item.start_time,
      end_time: item.end_time,
      statusCategory: category,
      project: item.project,
    });
  });

  // Limit deadlines to top 10 relevant items sorted by urgency
  const categoryOrder = { OVERDUE: 0, TODAY: 1, WITHIN_48H: 2, WITHIN_7D: 3 };
  deadlines.sort((a, b) => categoryOrder[a.statusCategory] - categoryOrder[b.statusCategory]);
  const topDeadlines = deadlines.slice(0, 8);

  // 4. Fetch Projects & Health (Phase 5 Integration)
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      *,
      tasks:tasks(id, status, due_date)
    `)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("updated_at", { ascending: false });

  const projectHealthList: DashboardProjectHealthItem[] = (projectsData || []).map((p: any) => {
    const tasks = p.tasks || [];
    const activeTasks = tasks.filter((t: any) => t.status !== "HOAN_THANH" && t.status !== "HUY");
    const completedTasks = tasks.filter((t: any) => t.status === "HOAN_THANH");

    const progressPct =
      tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const health = calculateProjectHealth(p.deadline, progressPct, activeTasks);

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      health,
      progress_pct: progressPct,
      completed_tasks: completedTasks.length,
      active_tasks: activeTasks.length,
      deadline: p.deadline,
    };
  });

  const attentionProjects = projectHealthList.filter(
    (p) => p.health === "OVERDUE" || p.health === "DELAYED" || p.health === "RISK"
  );

  // 5. Fetch Time Tracking Overview (Phase 8 Integration)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfDay);
  let dayOfWeek = startOfWeek.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("started_at", startOfWeek.toISOString());

  const todayIso = startOfDay.toISOString().substring(0, 10);
  let todayTotalSeconds = 0;
  let todayBillableSeconds = 0;
  let weekTotalSeconds = 0;
  let activeTimer = null;

  (timeEntries || []).forEach((entry: any) => {
    weekTotalSeconds += entry.duration_seconds;

    const entryDayStr = entry.started_at.substring(0, 10);
    if (entryDayStr === todayIso) {
      todayTotalSeconds += entry.duration_seconds;
      if (entry.is_billable) {
        todayBillableSeconds += entry.duration_seconds;
      }
    }

    if (entry.status === "running" || entry.status === "paused") {
      activeTimer = entry;
    }
  });

  // 6. Fetch Recent Notes (Phase 7 Integration)
  const { data: notesData } = await supabase
    .from("notes")
    .select(`
      *,
      project:projects(id, name, color)
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(5);

  return {
    greeting,
    userFullName,
    currentDateStr,
    focusCount: focusTasks.length,
    upcomingDeadlineCount: topDeadlines.filter((d) => d.statusCategory === "OVERDUE" || d.statusCategory === "TODAY").length,
    attentionProjectCount: attentionProjects.length,

    focusTasks,
    deadlines: topDeadlines,
    projectHealth: projectHealthList.slice(0, 5),
    calendarPreview: calendarPreview.slice(0, 5),
    timeSummary: {
      todayTotalSeconds,
      todayBillableSeconds,
      weekTotalSeconds,
    },
    recentNotes: notesData || [],
    activeTimer,
  };
}
