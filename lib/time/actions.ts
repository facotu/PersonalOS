import { createClient } from "@/lib/supabase/client";
import { TimeEntryItem, TimeFilterOptions } from "@/lib/time/types";
import { StartTimerInput, ManualTimeEntryInput, UpdateTimeEntryInput } from "@/lib/time/schemas";

/**
 * Validates that task belongs to specified project if both provided,
 * and validates user ownership.
 */
async function validateTaskProjectOwnership(
  supabase: any,
  userId: string,
  taskId?: string | null,
  projectId?: string | null
) {
  if (taskId) {
    const { data: task } = await supabase
      .from("tasks")
      .select("id, project_id, user_id")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();

    if (!task) {
      throw new Error("Công việc không tồn tại hoặc bạn không có quyền truy cập.");
    }

    if (task.project_id && projectId && task.project_id !== projectId) {
      throw new Error("Công việc này thuộc dự án khác. Không thể chọn sai dự án.");
    }
  }

  if (projectId) {
    const { data: proj } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (!proj) {
      throw new Error("Dự án không tồn tại hoặc bạn không có quyền truy cập.");
    }
  }
}

export async function fetchActiveTimeEntry(): Promise<TimeEntryItem | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("time_entries")
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .eq("user_id", user.id)
    .in("status", ["running", "paused"])
    .maybeSingle();

  if (error) {
    console.error("Error fetching active time entry:", error);
    return null;
  }

  return data;
}

export async function fetchTimeEntries(filters: TimeFilterOptions = {}): Promise<TimeEntryItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("time_entries")
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("started_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("started_at", filters.endDate);
  }
  if (filters.project_id) {
    query = query.eq("project_id", filters.project_id);
  }
  if (filters.task_id) {
    query = query.eq("task_id", filters.task_id);
  }
  if (filters.is_billable !== undefined) {
    query = query.eq("is_billable", filters.is_billable);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching time entries:", error);
    throw new Error("Không thể tải danh sách bản ghi thời gian.");
  }

  let results = data || [];

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().toLowerCase();
    results = results.filter((entry: any) => {
      const descMatch = entry.description?.toLowerCase().includes(term);
      const taskMatch = entry.task?.title.toLowerCase().includes(term);
      const projMatch = entry.project?.name.toLowerCase().includes(term);
      return descMatch || taskMatch || projMatch;
    });
  }

  return results;
}

export async function startTimerAction(input: StartTimerInput): Promise<TimeEntryItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  // Check existing active timer
  const active = await fetchActiveTimeEntry();
  if (active) {
    throw new Error("Bạn đang có một đồng hồ đếm giờ đang chạy hoặc tạm dừng. Vui lòng dừng đồng hồ hiện tại trước.");
  }

  // Auto infer project_id if task_id provided
  let effectiveProjectId = input.project_id;
  if (input.task_id && !effectiveProjectId) {
    const { data: task } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", input.task_id)
      .single();
    if (task?.project_id) {
      effectiveProjectId = task.project_id;
    }
  }

  await validateTaskProjectOwnership(supabase, user.id, input.task_id, effectiveProjectId);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      task_id: input.task_id || null,
      project_id: effectiveProjectId || null,
      description: input.description || null,
      is_billable: input.is_billable || false,
      hourly_rate: input.hourly_rate || null,
      started_at: new Date().toISOString(),
      status: "running",
      duration_seconds: 0,
    })
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    console.error("Error starting timer:", error);
    throw new Error(error?.message || "Không thể bắt đầu đếm giờ.");
  }

  return data;
}

export async function pauseTimerAction(id: string): Promise<TimeEntryItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data: entry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry || entry.status !== "running") {
    throw new Error("Đồng hồ không ở trạng thái đang chạy.");
  }

  const now = new Date();
  const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(entry.started_at).getTime()) / 1000));
  const newDuration = entry.duration_seconds + elapsed;

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      status: "paused",
      duration_seconds: newDuration,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    throw new Error("Không thể tạm dừng đồng hồ.");
  }

  return data;
}

export async function resumeTimerAction(id: string): Promise<TimeEntryItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data: entry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry || entry.status !== "paused") {
    throw new Error("Đồng hồ không ở trạng thái tạm dừng.");
  }

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      status: "running",
      started_at: new Date().toISOString(), // Reset start timestamp for next interval
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    throw new Error("Không thể tiếp tục đồng hồ.");
  }

  return data;
}

export async function stopTimerAction(id: string): Promise<TimeEntryItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data: entry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry || entry.status === "stopped") {
    throw new Error("Đồng hồ đã dừng.");
  }

  const now = new Date();
  let finalDuration = entry.duration_seconds;

  if (entry.status === "running") {
    const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(entry.started_at).getTime()) / 1000));
    finalDuration += elapsed;
  }

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      status: "stopped",
      ended_at: now.toISOString(),
      duration_seconds: finalDuration,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    throw new Error("Không thể dừng đồng hồ.");
  }

  // Also update Task actual_hours if task_id associated
  if (data.task_id) {
    const hours = Number((finalDuration / 3600).toFixed(2));
    const { data: task } = await supabase
      .from("tasks")
      .select("actual_hours")
      .eq("id", data.task_id)
      .single();
    if (task) {
      await supabase
        .from("tasks")
        .update({ actual_hours: Number((task.actual_hours + hours).toFixed(2)) })
        .eq("id", data.task_id);
    }
  }

  return data;
}

export async function createManualTimeEntryAction(input: ManualTimeEntryInput): Promise<TimeEntryItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const start = new Date(input.started_at);
  const end = new Date(input.ended_at);

  if (end <= start) {
    throw new Error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.");
  }

  const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

  let effectiveProjectId = input.project_id;
  if (input.task_id && !effectiveProjectId) {
    const { data: task } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", input.task_id)
      .single();
    if (task?.project_id) {
      effectiveProjectId = task.project_id;
    }
  }

  await validateTaskProjectOwnership(supabase, user.id, input.task_id, effectiveProjectId);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      task_id: input.task_id || null,
      project_id: effectiveProjectId || null,
      description: input.description || null,
      started_at: start.toISOString(),
      ended_at: end.toISOString(),
      duration_seconds: durationSeconds,
      status: "stopped",
      is_billable: input.is_billable || false,
      hourly_rate: input.hourly_rate || null,
    })
    .select(`
      *,
      task:tasks(id, title, project_id),
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    console.error("Error creating manual time entry:", error);
    throw new Error("Không thể thêm bản ghi thời gian thủ công.");
  }

  return data;
}

export async function updateTimeEntryAction(
  id: string,
  input: UpdateTimeEntryInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const patch: any = { ...input };

  if (input.started_at && input.ended_at) {
    const start = new Date(input.started_at);
    const end = new Date(input.ended_at);
    if (end <= start) {
      throw new Error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.");
    }
    patch.duration_seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  }

  const { error } = await supabase
    .from("time_entries")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating time entry:", error);
    throw new Error("Không thể cập nhật bản ghi thời gian.");
  }
}

export async function deleteTimeEntryAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting time entry:", error);
    throw new Error("Không thể xóa bản ghi thời gian.");
  }
}
