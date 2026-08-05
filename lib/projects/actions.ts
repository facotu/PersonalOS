import { createClient } from "@/lib/supabase/client";
import { ProjectItem, ProjectFilterOptions, ProjectHealthStatus } from "@/lib/projects/types";
import { CreateProjectInput, UpdateProjectInput } from "@/lib/projects/schemas";

/**
 * Health assessment helper logic (Rule-based)
 */

function calculateProjectHealth(
  status: string,
  deadline: string | null,
  progressPct: number,
  overdueTasksCount: number
): ProjectHealthStatus {
  if (status === "Completed") return "GOOD";

  const now = new Date();
  if (deadline) {
    const due = new Date(deadline);
    if (due < now && status !== "Completed" && status !== "Archived") {
      return "OVERDUE";
    }

    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (overdueTasksCount > 0 || (diffDays <= 3 && progressPct < 50)) {
      return "DELAYED";
    }
    if (diffDays <= 7 && progressPct < 80) {
      return "RISK";
    }
  } else if (overdueTasksCount > 0) {
    return "DELAYED";
  }

  return "GOOD";
}

export async function fetchProjects(filters: ProjectFilterOptions = {}): Promise<ProjectItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("projects")
    .select(`
      *,
      tasks(id, status, due_date)
    `)
    .eq("user_id", user.id);

  // View Filters
  if (filters.view === "active") {
    query = query.eq("status", "Active");
  } else if (filters.view === "upcoming") {
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    query = query
      .lte("deadline", weekLater.toISOString())
      .neq("status", "Completed")
      .neq("status", "Archived");
  } else if (filters.view === "completed") {
    query = query.eq("status", "Completed");
  } else if (filters.view === "archived") {
    query = query.eq("status", "Archived");
  } else {
    // Default view: exclude Archived unless explicitly requested
    query = query.neq("status", "Archived");
  }

  // Search
  if (filters.search && filters.search.trim() !== "") {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term},goal.ilike.${term}`);
  }

  // Priority Filter
  if (filters.priority && filters.priority.length > 0) {
    query = query.in("priority", filters.priority);
  }

  // Sort
  const sortField = filters.sortBy || "priority";
  const ascending = filters.sortOrder === "asc";
  query = query.order(sortField, { ascending });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Không thể tải danh sách dự án.");
  }

  const nowIso = new Date().toISOString();

  return (data || []).map((proj: any) => {
    const projTasks = proj.tasks || [];
    const totalCount = projTasks.length;
    const activeTasks = projTasks.filter((t: any) => t.status !== "HUY");
    const activeCount = activeTasks.length;
    const completedCount = projTasks.filter((t: any) => t.status === "HOAN_THANH").length;
    const overdueCount = projTasks.filter(
      (t: any) => t.status !== "HOAN_THANH" && t.status !== "HUY" && t.due_date && t.due_date < nowIso
    ).length;

    // Strict Progress Computation Formula (0% if active_tasks = 0)
    const computedProgressPct =
      activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

    const health = calculateProjectHealth(
      proj.status,
      proj.deadline,
      computedProgressPct,
      overdueCount
    );

    return {
      ...proj,
      progress_pct: computedProgressPct,
      total_tasks_count: totalCount,
      completed_tasks_count: completedCount,
      active_tasks_count: activeCount,
      overdue_tasks_count: overdueCount,
      health,
    };
  });
}

export async function fetchProjectById(id: string): Promise<ProjectItem | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      tasks(id, status, due_date)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  const nowIso = new Date().toISOString();
  const projTasks = data.tasks || [];
  const totalCount = projTasks.length;
  const activeTasks = projTasks.filter((t: any) => t.status !== "HUY");
  const activeCount = activeTasks.length;
  const completedCount = projTasks.filter((t: any) => t.status === "HOAN_THANH").length;
  const overdueCount = projTasks.filter(
    (t: any) => t.status !== "HOAN_THANH" && t.status !== "HUY" && t.due_date && t.due_date < nowIso
  ).length;

  const computedProgressPct =
    activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

  const health = calculateProjectHealth(
    data.status,
    data.deadline,
    computedProgressPct,
    overdueCount
  );

  return {
    ...data,
    progress_pct: computedProgressPct,
    total_tasks_count: totalCount,
    completed_tasks_count: completedCount,
    active_tasks_count: activeCount,
    overdue_tasks_count: overdueCount,
    health,
  };
}

export async function createProjectAction(input: CreateProjectInput): Promise<ProjectItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...input,
      user_id: user.id, // Strictly server bound to auth user
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating project:", error);
    throw new Error(error?.message || "Không thể tạo dự án mới.");
  }

  return {
    ...data,
    total_tasks_count: 0,
    completed_tasks_count: 0,
    active_tasks_count: 0,
    overdue_tasks_count: 0,
    health: "GOOD",
  };
}

export async function updateProjectAction(
  id: string,
  input: UpdateProjectInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Không thể cập nhật dự án.");
  }
}

export async function archiveProjectAction(id: string): Promise<void> {
  await updateProjectAction(id, { status: "Archived" });
}

export async function deleteProjectAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Không thể xóa dự án.");
  }
}
