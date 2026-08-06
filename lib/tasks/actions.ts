import { createClient } from "@/lib/supabase/client";
import { TaskItem, TaskFilterOptions } from "@/lib/tasks/types";
import { CreateTaskInput, UpdateTaskInput } from "@/lib/tasks/schemas";

export async function fetchTasks(filters: TaskFilterOptions = {}): Promise<TaskItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("tasks")
    .select(`
      *,
      project:projects(id, name, color),
      task_tags(tag:tags(id, name, color))
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  // Apply View Filtering
  if (filters.view === "today") {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    query = query
      .or(`due_date.lte.${todayEnd.toISOString()},status.eq.DANG_LAM`)
      .neq("status", "HOAN_THANH")
      .neq("status", "HUY");
  } else if (filters.view === "week") {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    query = query
      .lte("due_date", weekEnd.toISOString())
      .neq("status", "HOAN_THANH");
  } else if (filters.view === "overdue") {
    const now = new Date().toISOString();
    query = query
      .lt("due_date", now)
      .neq("status", "HOAN_THANH")
      .neq("status", "HUY");
  } else if (filters.view === "completed") {
    query = query.eq("status", "HOAN_THANH");
  }

  // Search
  if (filters.search && filters.search.trim() !== "") {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  // Status Filter
  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  // Priority Filter
  if (filters.priority && filters.priority.length > 0) {
    query = query.in("priority", filters.priority);
  }

  // Project Filter
  if (filters.project_id) {
    query = query.eq("project_id", filters.project_id);
  }

  // Tag Filter
  if (filters.tag_id) {
    const { data: ttData } = await supabase
      .from("task_tags")
      .select("task_id")
      .eq("tag_id", filters.tag_id);
    const taskIds = (ttData || []).map((x) => x.task_id);
    if (taskIds.length === 0) {
      return [];
    }
    query = query.in("id", taskIds);
  }

  // Sorting
  const sortField = filters.sortBy || "priority";
  const ascending = filters.sortOrder === "asc";
  query = query.order(sortField, { ascending });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Không thể tải danh sách công việc.");
  }

  return (data || []).map((t: any) => ({
    ...t,
    tags: (t.task_tags || []).map((tt: any) => tt.tag).filter(Boolean),
  }));
}

export async function createTaskAction(input: CreateTaskInput): Promise<TaskItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn cần đăng nhập để tạo công việc.");

  const { tag_ids, ...taskData } = input;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      user_id: user.id, // Strictly server bound to authenticated user
    })
    .select(`
      *,
      project:projects(id, name, color)
    `)
    .single();

  if (error || !data) {
    console.error("Error creating task:", error);
    throw new Error(error?.message || "Không thể tạo công việc mới.");
  }

  // Attach Tags if provided
  if (tag_ids && tag_ids.length > 0) {
    const taskTagsToInsert = tag_ids.map((tag_id) => ({
      task_id: data.id,
      tag_id,
    }));
    await supabase.from("task_tags").insert(taskTagsToInsert);
  }

  return {
    ...data,
    tags: [],
  };
}

export async function updateTaskAction(
  id: string,
  input: UpdateTaskInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { tag_ids, ...updateData } = input;

  // Handle completion timestamp on server
  const patch: any = { ...updateData };
  if (patch.status === "HOAN_THANH") {
    patch.completed_at = new Date().toISOString();
    patch.completion_pct = 100;
  } else if (patch.status && patch.status !== "HOAN_THANH") {
    patch.completed_at = null;
  }

  const { error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id); // RLS & Server ownership enforcement

  if (error) {
    console.error("Error updating task:", error);
    throw new Error("Không thể cập nhật công việc.");
  }

  // Update Tags if provided
  if (tag_ids !== undefined) {
    await supabase.from("task_tags").delete().eq("task_id", id);
    if (tag_ids.length > 0) {
      const taskTagsToInsert = tag_ids.map((tag_id) => ({
        task_id: id,
        tag_id,
      }));
      await supabase.from("task_tags").insert(taskTagsToInsert);
    }
  }
}

export async function deleteTaskAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error("Không thể xóa công việc.");
  }
}

export async function fetchProjectsOptions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("projects")
    .select("id, name, color")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("name");

  return data || [];
}

export async function fetchTagsOptions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", user.id)
    .order("name");

  return data || [];
}

export async function createTagAction(name: string, color: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: user.id,
      name: name.trim(),
      color,
    })
    .select("id, name, color")
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    if (error.code === "23505") {
      throw new Error("Tên nhãn dán này đã tồn tại.");
    }
    throw new Error("Không thể tạo nhãn dán mới.");
  }

  return data;
}

export async function deleteTagAction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Không thể xóa nhãn dán.");
  }
}
