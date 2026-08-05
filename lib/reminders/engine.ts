import { createClient } from "@/lib/supabase/client";
import { NotificationType, ReminderSourceType } from "@/lib/reminders/types";

/**
 * Centralized Timezone Retrieval with Fallback
 */
export async function getUserTimezone(supabase: any, userId: string): Promise<string> {
  const { data: settings } = await supabase
    .from("user_settings")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle();

  return settings?.timezone || "Asia/Ho_Chi_Minh";
}

/**
 * Calculates Tomorrow 09:00 AM timestamp in specified user timezone
 */
export function getTomorrow9AMTime(timezoneStr: string = "Asia/Ho_Chi_Minh"): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Helper to check if current date/time is within Quiet Hours (e.g., 22:00 -> 07:00)
 */
function isWithinQuietHours(startStr: string = "22:00", endStr: string = "07:00"): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = startStr.split(":").map(Number);
  const [eH, eM] = endStr.split(":").map(Number);

  const startMinutes = sH * 60 + (sM || 0);
  const endMinutes = eH * 60 + (eM || 0);

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export class ReminderEngine {
  /**
   * Scans tasks, projects, and calendar events to generate due reminders.
   * Enforces strict completion suppression, idempotency keys, and quiet hours.
   */
  static async evaluateReminders(): Promise<number> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const timezone = await getUserTimezone(supabase, user.id);

    // Fetch User Notification Preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const allow24h = prefs?.deadline_24h ?? true;
    const allow1h = prefs?.deadline_1h ?? true;
    const allowOverdue = prefs?.overdue ?? true;

    const inQuietHours = isWithinQuietHours("22:00", "07:00");
    let newlyCreatedCount = 0;
    const now = new Date();
    const nowTime = now.getTime();

    // Fetch Existing Notifications for Deduplication
    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("metadata, scheduled_at")
      .eq("user_id", user.id);

    const existingKeys = new Set<string>();
    (existingNotifications || []).forEach((n: any) => {
      const meta = n.metadata || {};
      if (meta.source_type && meta.source_id && meta.reminder_type) {
        // Precise identity: user_id + source_type + source_id + reminder_type + scheduled_at
        const schedTime = n.scheduled_at ? n.scheduled_at.substring(0, 16) : "";
        existingKeys.add(`${meta.source_type}_${meta.source_id}_${meta.reminder_type}_${schedTime}`);
      }
    });

    // 1. EVALUATE TASK REMINDERS (Suppressed if status === 'HOAN_THANH' or 'HUY')
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, status, project_id")
      .eq("user_id", user.id)
      .not("due_date", "is", null);

    if (tasks) {
      for (const task of tasks) {
        // STRICT COMPLETION SUPPRESSION
        if (task.status === "HOAN_THANH" || task.status === "HUY") {
          continue; // Completely suppressed!
        }

        const dueDate = new Date(task.due_date);
        const dueTime = dueDate.getTime();
        const diffHours = (dueTime - nowTime) / (3600 * 1000);
        const schedTimeStr = dueDate.toISOString().substring(0, 16);

        // Task Overdue
        if (dueTime < nowTime && allowOverdue) {
          const key = `TASK_${task.id}_overdue_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "OVERDUE",
              title: "Công việc đã quá hạn",
              message: `Công việc "${task.title}" đã quá hạn. Vui lòng xử lý.`,
              link_url: `/tasks`,
              metadata: { source_type: "TASK", source_id: task.id, reminder_type: "overdue" },
              scheduledAtIso: dueDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
        // Task 24h Before
        else if (diffHours > 0 && diffHours <= 24 && allow24h) {
          const key = `TASK_${task.id}_24h_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_24H",
              title: "Công việc sắp đến hạn (24 giờ)",
              message: `Công việc "${task.title}" đến hạn vào ngày mai.`,
              link_url: `/tasks`,
              metadata: { source_type: "TASK", source_id: task.id, reminder_type: "24h" },
              scheduledAtIso: dueDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
        // Task 2h Before
        else if (diffHours > 0 && diffHours <= 2 && allow1h) {
          const key = `TASK_${task.id}_2h_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_1H",
              title: "Công việc sắp đến hạn (2 giờ)",
              message: `Công việc "${task.title}" còn khoảng 2 giờ nữa.`,
              link_url: `/tasks`,
              metadata: { source_type: "TASK", source_id: task.id, reminder_type: "2h" },
              scheduledAtIso: dueDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
      }
    }

    // 2. EVALUATE PROJECT DEADLINE REMINDERS (Suppressed if status === 'Completed' or 'Archived')
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, deadline, status")
      .eq("user_id", user.id)
      .not("deadline", "is", null);

    if (projects) {
      for (const proj of projects) {
        // STRICT COMPLETION SUPPRESSION FOR PROJECTS
        if (proj.status === "Completed" || proj.status === "Archived") {
          continue; // Completely suppressed!
        }

        const deadlineDate = new Date(proj.deadline);
        const deadlineTime = deadlineDate.getTime();
        const diffDays = (deadlineTime - nowTime) / (86400 * 1000);
        const schedTimeStr = deadlineDate.toISOString().substring(0, 16);

        // Project 7d / 3d / 1d Presets
        if (diffDays > 0 && diffDays <= 7 && diffDays > 3) {
          const key = `PROJECT_${proj.id}_7d_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_24H",
              title: "Hạn chót dự án (7 ngày)",
              message: `Dự án "${proj.name}" sẽ hết hạn trong 7 ngày tới.`,
              link_url: `/projects/${proj.id}`,
              metadata: { source_type: "PROJECT", source_id: proj.id, reminder_type: "7d" },
              scheduledAtIso: deadlineDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        } else if (diffDays > 0 && diffDays <= 3 && diffDays > 1) {
          const key = `PROJECT_${proj.id}_3d_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_24H",
              title: "Hạn chót dự án (3 ngày)",
              message: `Dự án "${proj.name}" sẽ hết hạn trong 3 ngày tới.`,
              link_url: `/projects/${proj.id}`,
              metadata: { source_type: "PROJECT", source_id: proj.id, reminder_type: "3d" },
              scheduledAtIso: deadlineDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        } else if (diffDays > 0 && diffDays <= 1) {
          const key = `PROJECT_${proj.id}_1d_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_24H",
              title: "Hạn chót dự án (1 ngày)",
              message: `Dự án "${proj.name}" sẽ hết hạn vào ngày mai.`,
              link_url: `/projects/${proj.id}`,
              metadata: { source_type: "PROJECT", source_id: proj.id, reminder_type: "1d" },
              scheduledAtIso: deadlineDate.toISOString(),
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
      }
    }

    // 3. EVALUATE CALENDAR EVENT REMINDERS (30m & 10m Presets, Suppressed if event end_time < now)
    const { data: events } = await supabase
      .from("calendar_events")
      .select("id, title, start_time, end_time")
      .eq("user_id", user.id)
      .gte("start_time", now.toISOString());

    if (events) {
      for (const ev of events) {
        // STRICT COMPLETION SUPPRESSION FOR EXPIRED EVENTS
        if (ev.end_time && new Date(ev.end_time).getTime() < nowTime) {
          continue;
        }

        const startTime = new Date(ev.start_time).getTime();
        const diffMinutes = (startTime - nowTime) / (60 * 1000);
        const schedTimeStr = new Date(ev.start_time).toISOString().substring(0, 16);

        // 30m Before
        if (diffMinutes > 10 && diffMinutes <= 30) {
          const key = `CALENDAR_EVENT_${ev.id}_30m_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_1H",
              title: "Sự kiện sắp bắt đầu (30 phút)",
              message: `Sự kiện "${ev.title}" sẽ diễn ra trong 30 phút nữa.`,
              link_url: `/calendar`,
              metadata: { source_type: "CALENDAR_EVENT", source_id: ev.id, reminder_type: "30m" },
              scheduledAtIso: ev.start_time,
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
        // 10m Before
        else if (diffMinutes > 0 && diffMinutes <= 10) {
          const key = `CALENDAR_EVENT_${ev.id}_10m_${schedTimeStr}`;
          if (!existingKeys.has(key)) {
            await this.insertNotification(supabase, user.id, {
              type: "DEADLINE_1H",
              title: "Sự kiện sắp bắt đầu (10 phút)",
              message: `Sự kiện "${ev.title}" sẽ diễn ra trong 10 phút nữa.`,
              link_url: `/calendar`,
              metadata: { source_type: "CALENDAR_EVENT", source_id: ev.id, reminder_type: "10m" },
              scheduledAtIso: ev.start_time,
              delayForQuietHours: inQuietHours,
            });
            existingKeys.add(key);
            newlyCreatedCount++;
          }
        }
      }
    }

    return newlyCreatedCount;
  }

  private static async insertNotification(
    supabase: any,
    userId: string,
    params: {
      type: NotificationType;
      title: string;
      message: string;
      link_url: string;
      metadata: any;
      scheduledAtIso: string;
      delayForQuietHours: boolean;
    }
  ) {
    const scheduledAt = params.delayForQuietHours
      ? new Date(Date.now() + 8 * 3600 * 1000).toISOString()
      : params.scheduledAtIso;

    await supabase.from("notifications").insert({
      user_id: userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link_url: params.link_url,
      metadata: params.metadata,
      scheduled_at: scheduledAt,
      sent_at: scheduledAt,
      is_read: false,
    });
  }
}
