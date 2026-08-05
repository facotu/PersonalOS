import { createClient } from "@/lib/supabase/client";
import { AutomationEnvelopePayload } from "@/lib/automation/types";
import { ReminderEngine } from "@/lib/reminders/engine";
import { getDashboardData } from "@/lib/dashboard/actions";
import { getWeeklyAnalytics } from "@/lib/analytics/actions";
import { ExportService } from "@/lib/export/service";

export class AutomationService {
  /**
   * Orchestrates incoming automation events by delegating to existing PERSONAL OS Data Layers & Engines.
   */
  static async processEvent(payload: AutomationEnvelopePayload, userId: string): Promise<Record<string, any>> {
    const supabase = createClient();

    // 1. Fetch User Settings & Timezone
    const { data: settings } = await supabase
      .from("user_settings")
      .select("timezone")
      .eq("user_id", userId)
      .maybeSingle();

    const timezone = settings?.timezone || "Asia/Ho_Chi_Minh";

    switch (payload.event) {
      // WF-01 & WF-04: Daily Reminder Evaluation / Overdue Escalation
      case "reminders.evaluate":
      case "task.overdue":
      case "project.deadline_approaching": {
        const count = await ReminderEngine.evaluateReminders();
        return {
          event: payload.event,
          remindersEvaluatedCount: count,
          timezone,
          executedAt: new Date().toISOString(),
        };
      }

      // WF-02: Daily Digest Generation
      case "digest.daily": {
        const dashboard = await getDashboardData();
        return {
          event: payload.event,
          summary: {
            todayTaskCount: dashboard.summary.todayTaskCount,
            overdueTaskCount: dashboard.summary.overdueTaskCount,
            activeProjectCount: dashboard.summary.activeProjectCount,
            todayTimeSeconds: dashboard.summary.todayTimeSeconds,
            focusTasks: dashboard.focusTasks.slice(0, 3).map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
            })),
          },
          timezone,
          generatedAt: new Date().toISOString(),
        };
      }

      // WF-05: Weekly Review Reminder Check
      case "weekly.review_due": {
        const now = new Date();
        const currentYear = now.getFullYear();
        // Simple week number calculation
        const firstDayOfYear = new Date(currentYear, 0, 1);
        const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

        const { data: existingReview } = await supabase
          .from("weekly_reviews")
          .select("id")
          .eq("user_id", userId)
          .eq("year", currentYear)
          .eq("week_number", weekNum)
          .maybeSingle();

        if (!existingReview) {
          // Trigger a weekly review reminder notification
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "WEEKLY_REVIEW",
            title: "Nhắc nhở Tổng kết Tuần",
            message: `Bạn chưa hoàn thành bản Tổng kết Tuần ${weekNum}. Hãy dành 5 phút để nhìn lại thành quả!`,
            link_url: "/analytics",
            is_read: false,
          });
          return { event: payload.event, reminderSent: true, weekNumber: weekNum };
        }
        return { event: payload.event, reminderSent: false, reason: "REVIEW_ALREADY_COMPLETED" };
      }

      // WF-06: Weekly Analytics Snapshot
      case "weekly.analytics_ready": {
        const analytics = await getWeeklyAnalytics();
        return {
          event: payload.event,
          analyticsSummary: {
            period: analytics.period.formattedRange,
            completedTasks: analytics.overview.completedTasksCount,
            completionRatePct: analytics.overview.completionRatePct,
            totalTimeSeconds: analytics.overview.totalTimeSeconds,
          },
          generatedAt: new Date().toISOString(),
        };
      }

      // WF-07: Export Automation Trigger
      case "export.requested": {
        const resource = payload.data?.resource || "tasks";
        const format = payload.data?.format || "xlsx";
        const result = await ExportService.exportData(resource, format, payload.data?.filters || {});
        return {
          event: payload.event,
          filename: result.filename,
          mimeType: result.mimeType,
          status: "EXPORT_COMPLETED",
        };
      }

      default:
        return {
          event: payload.event,
          status: "IGNORED",
          message: "Event type not bound to custom workflow.",
        };
    }
  }
}
