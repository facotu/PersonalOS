import { createClient } from "@/lib/supabase/client";
import {
  CalendarEventItem,
  UnifiedCalendarItem,
  CalendarFilterOptions,
} from "@/lib/calendar/types";
import { CreateEventInput, UpdateEventInput } from "@/lib/calendar/schemas";

export async function fetchCalendarEvents(
  startIso: string,
  endIso: string
): Promise<CalendarEventItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", startIso)
    .lte("end_time", endIso)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching calendar events:", error);
    throw new Error("Không thể tải sự kiện lịch.");
  }

  return data || [];
}

export async function fetchUnifiedCalendarItems(
  startIso: string,
  endIso: string,
  filters: CalendarFilterOptions = {}
): Promise<UnifiedCalendarItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const items: UnifiedCalendarItem[] = [];

  // 1. Fetch Calendar Events (Kind: event)
  if (filters.showEvents !== false) {
    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", startIso)
      .lte("start_time", endIso)
      .order("start_time", { ascending: true });

    (events || []).forEach((evt: any) => {
      items.push({
        id: evt.id,
        kind: "event",
        title: evt.title,
        start_time: evt.start_time,
        end_time: evt.end_time,
        is_all_day: evt.is_all_day,
        rawEvent: evt,
      });
    });
  }

  // 2. Fetch Tasks with due_date (Kind: task)
  if (filters.showTasks !== false) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .not("due_date", "is", null)
      .gte("due_date", startIso)
      .lte("due_date", endIso);

    (tasks || []).forEach((t: any) => {
      const due = t.due_date;
      // Task end_time is due_date, start_time defaults to 30 mins before or same
      const startTime = new Date(new Date(due).getTime() - 30 * 60 * 1000).toISOString();
      items.push({
        id: t.id,
        kind: "task",
        title: t.title,
        start_time: startTime,
        end_time: due,
        is_all_day: false,
        priority: t.priority,
        status: t.status,
        color: t.project?.color || "#3b82f6",
        rawTask: t,
      });
    });
  }

  // 3. Fetch Projects with deadline (Kind: project_deadline)
  if (filters.showProjects !== false) {
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .not("deadline", "is", null)
      .gte("deadline", startIso.substring(0, 10))
      .lte("deadline", endIso.substring(0, 10));

    (projects || []).forEach((p: any) => {
      const deadlineIso = new Date(`${p.deadline}T23:59:59.999Z`).toISOString();
      items.push({
        id: p.id,
        kind: "project_deadline",
        title: `${p.name} — Hạn chót`,
        start_time: deadlineIso,
        end_time: deadlineIso,
        is_all_day: true,
        color: p.color || "#8b5cf6",
        priority: p.priority,
        status: p.status,
        rawProject: p,
      });
    });
  }

  // Filter Search
  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(term));
  }

  return items;
}

export async function createEventAction(input: CreateEventInput): Promise<CalendarEventItem> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      ...input,
      user_id: user.id, // Strictly server bound to auth user
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating event:", error);
    throw new Error(error?.message || "Không thể tạo sự kiện mới.");
  }

  return data;
}

export async function updateEventAction(
  id: string,
  input: UpdateEventInput
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("calendar_events")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error updating event:", error);
    throw new Error("Không thể cập nhật sự kiện.");
  }
}

export async function deleteEventAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforcement

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error("Không thể xóa sự kiện.");
  }
}
