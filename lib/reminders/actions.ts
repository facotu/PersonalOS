import { createClient } from "@/lib/supabase/client";
import { NotificationItem, NotificationFilterOptions, NotificationPreferences } from "@/lib/reminders/types";
import { ReminderEngine, getUserTimezone, getTomorrow9AMTime } from "@/lib/reminders/engine";

export async function fetchNotifications(
  filters: NotificationFilterOptions = {}
): Promise<{ notifications: NotificationItem[]; total: number; unreadCount: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { notifications: [], total: 0, unreadCount: 0 };

  // Evaluate due reminders on-demand
  await ReminderEngine.evaluateReminders();

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.status === "unread") {
    query = query.eq("is_read", false);
  } else if (filters.status === "read") {
    query = query.eq("is_read", true);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Không thể tải danh sách thông báo.");
  }

  let results: NotificationItem[] = (data || []).map((n: any) => ({
    ...n,
    metadata: n.metadata || {},
  }));

  // Filter out dismissed notifications
  results = results.filter((n) => !n.metadata?.dismissed);

  // Filter by source_type if specified
  if (filters.source_type) {
    results = results.filter((n) => n.metadata?.source_type === filters.source_type);
  }

  const unreadCount = results.filter((n) => !n.is_read).length;

  return {
    notifications: results,
    total: count || results.length,
    unreadCount,
  };
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return 0;

  return count || 0;
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking notification read:", error);
    throw new Error("Không thể đánh dấu thông báo đã đọc.");
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications read:", error);
    throw new Error("Không thể đánh dấu tất cả thông báo đã đọc.");
  }
}

export async function snoozeNotificationAction(
  id: string,
  preset: "15m" | "30m" | "1h" | "tomorrow_9am"
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data: notif } = await supabase
    .from("notifications")
    .select("metadata")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!notif) throw new Error("Thông báo không tồn tại.");

  const meta = notif.metadata || {};

  // Check completion suppression before snoozing
  if (meta.source_type === "TASK" && meta.source_id) {
    const { data: task } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", meta.source_id)
      .single();

    if (task && (task.status === "HOAN_THANH" || task.status === "HUY")) {
      throw new Error("Công việc đã hoàn thành hoặc hủy. Không thể báo lại.");
    }
  } else if (meta.source_type === "PROJECT" && meta.source_id) {
    const { data: proj } = await supabase
      .from("projects")
      .select("status")
      .eq("id", meta.source_id)
      .single();

    if (proj && (proj.status === "Completed" || proj.status === "Archived")) {
      throw new Error("Dự án đã kết thúc. Không thể báo lại.");
    }
  }

  // Calculate snoozed_until timestamp
  let snoozedUntil: string;
  const timezone = await getUserTimezone(supabase, user.id);

  if (preset === "15m") {
    snoozedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  } else if (preset === "30m") {
    snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  } else if (preset === "1h") {
    snoozedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  } else {
    // tomorrow_9am in user timezone
    snoozedUntil = getTomorrow9AMTime(timezone);
  }

  const updatedMeta = {
    ...meta,
    snoozed_until: snoozedUntil,
  };

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      metadata: updatedMeta,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error snoozing notification:", error);
    throw new Error("Không thể báo lại thông báo.");
  }
}

export async function dismissNotificationAction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data: notif } = await supabase
    .from("notifications")
    .select("metadata")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const updatedMeta = {
    ...(notif?.metadata || {}),
    dismissed: true,
  };

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      metadata: updatedMeta,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error dismissing notification:", error);
    throw new Error("Không thể bỏ qua thông báo.");
  }
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching preferences:", error);
  }

  if (!data) {
    const { data: created } = await supabase
      .from("notification_preferences")
      .insert({ user_id: user.id })
      .select("*")
      .single();
    return created || {
      user_id: user.id,
      deadline_24h: true,
      deadline_1h: true,
      overdue: true,
      daily_brief: true,
      weekly_review: true,
      email_enabled: true,
      push_enabled: true,
    };
  }

  return data;
}

export async function updateNotificationPreferencesAction(
  input: Partial<NotificationPreferences>
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Bạn chưa đăng nhập.");

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      ...input,
      user_id: user.id,
    });

  if (error) {
    console.error("Error updating notification preferences:", error);
    throw new Error("Không thể cập nhật cấu hình thông báo.");
  }
}
