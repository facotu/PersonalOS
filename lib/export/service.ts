import { createClient } from "@/lib/supabase/client";
import { ExportResource, ExportFormat, ExportFilterOptions, ExportResult } from "@/lib/export/types";
import { formatAsCSV } from "@/lib/export/formatters/csv";
import { formatAsXLSX, SheetData } from "@/lib/export/formatters/xlsx";
import { formatAsPDF } from "@/lib/export/formatters/pdf";
import { getWeeklyAnalytics } from "@/lib/analytics/actions";
import { getDashboardData } from "@/lib/dashboard/actions";
import { formatSummaryDuration } from "@/components/timer/time-entry-row";

export class ExportService {
  /**
   * Main Export Entrypoint: Validates session & RLS, fetches data via adapters, formats result.
   */
  static async exportData(
    resource: ExportResource,
    format: ExportFormat,
    filters: ExportFilterOptions = {}
  ): Promise<ExportResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn chưa đăng nhập. Không thể xuất dữ liệu.");
    }

    const timestampStr = new Date().toISOString().substring(0, 10);
    let filename = `personal-os-${resource}-${timestampStr}`;

    switch (resource) {
      case "tasks":
        return this.exportTasks(supabase, user.id, format, filters, filename);
      case "projects":
        return this.exportProjects(supabase, user.id, format, filters, filename);
      case "calendar":
        return this.exportCalendar(supabase, user.id, format, filters, filename);
      case "time":
        return this.exportTimeEntries(supabase, user.id, format, filters, filename);
      case "analytics":
        return this.exportAnalytics(format, filters, filename);
      case "notes":
        return this.exportNotes(supabase, user.id, format, filters, filename);
      case "dashboard":
        return this.exportDashboard(format, filename);
      default:
        throw new Error("Loại dữ liệu xuất không hợp lệ.");
    }
  }

  // 1. TASK EXPORT ADAPTER
  private static async exportTasks(
    supabase: any,
    userId: string,
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    let query = supabase
      .from("tasks")
      .select("*, projects(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (filters.projectId) query = query.eq("project_id", filters.projectId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.priority) query = query.eq("priority", filters.priority);
    if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

    const { data: tasks, error } = await query;
    if (error) throw new Error("Không thể tải dữ liệu Công việc.");
    if (!tasks || tasks.length === 0) throw new Error("Không có dữ liệu công việc phù hợp với bộ lọc.");

    const headers = [
      "Mã công việc",
      "Tiêu đề",
      "Mô tả",
      "Trạng thái",
      "Ưu tiên",
      "Hạn chót",
      "Dự án",
      "Ngày tạo",
    ];

    const rows = tasks.map((t: any) => [
      t.id.substring(0, 8),
      t.title,
      t.description || "",
      t.status,
      t.priority,
      t.due_date ? new Date(t.due_date).toLocaleDateString("vi-VN") : "Khóa mốc",
      t.projects?.name || "Không thuộc dự án",
      new Date(t.created_at).toLocaleDateString("vi-VN"),
    ]);

    if (format === "csv") {
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(headers, rows),
      };
    } else if (format === "xlsx") {
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX([{ name: "Danh sách Công việc", headers, rows }]),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO DANH SÁCH CÔNG VIỆC",
          [
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
            { label: "Tổng số task", value: String(tasks.length) },
          ],
          [{ title: "Bảng chi tiết công việc", headers, rows }]
        ),
      };
    }
  }

  // 2. PROJECT EXPORT ADAPTER
  private static async exportProjects(
    supabase: any,
    userId: string,
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    let query = supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (filters.status) query = query.eq("status", filters.status);

    const { data: projects, error } = await query;
    if (error) throw new Error("Không thể tải dữ liệu Dự án.");
    if (!projects || projects.length === 0) throw new Error("Không có dữ liệu dự án phù hợp.");

    const headers = [
      "Mã dự án",
      "Tên dự án",
      "Mô tả",
      "Trạng thái",
      "Tiến độ (%)",
      "Hạn chót",
      "Sức khỏe",
      "Ngày tạo",
    ];

    const rows = projects.map((p: any) => [
      p.id.substring(0, 8),
      p.name,
      p.description || "",
      p.status,
      p.progress || 0,
      p.deadline ? new Date(p.deadline).toLocaleDateString("vi-VN") : "Khóa mốc",
      p.health || "GOOD",
      new Date(p.created_at).toLocaleDateString("vi-VN"),
    ]);

    if (format === "csv") {
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(headers, rows),
      };
    } else if (format === "xlsx") {
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX([{ name: "Danh sách Dự án", headers, rows }]),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO QUẢN LÝ DỰ ÁN",
          [
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
            { label: "Tổng số dự án", value: String(projects.length) },
          ],
          [{ title: "Bảng theo dõi tiến độ dự án", headers, rows }]
        ),
      };
    }
  }

  // 3. CALENDAR EXPORT ADAPTER
  private static async exportCalendar(
    supabase: any,
    userId: string,
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    let query = supabase
      .from("calendar_events")
      .select("*, projects(name)")
      .eq("user_id", userId)
      .order("start_time", { ascending: true })
      .limit(10000);

    if (filters.dateFrom) query = query.gte("start_time", filters.dateFrom);
    if (filters.dateTo) query = query.lte("end_time", filters.dateTo);

    const { data: events, error } = await query;
    if (error) throw new Error("Không thể tải dữ liệu Lịch.");
    if (!events || events.length === 0) throw new Error("Không có sự kiện lịch phù hợp với bộ lọc.");

    const headers = [
      "Tên sự kiện",
      "Loại",
      "Thời gian bắt đầu",
      "Thời gian kết thúc",
      "Địa điểm",
      "Dự án",
    ];

    const rows = events.map((e: any) => [
      e.title,
      e.event_type || "Meeting",
      new Date(e.start_time).toLocaleString("vi-VN"),
      new Date(e.end_time).toLocaleString("vi-VN"),
      e.location || "Không có",
      e.projects?.name || "Không có",
    ]);

    if (format === "csv") {
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(headers, rows),
      };
    } else if (format === "xlsx") {
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX([{ name: "Lịch sự kiện", headers, rows }]),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO LỊCH & SỰ KIỆN",
          [
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
            { label: "Số sự kiện", value: String(events.length) },
          ],
          [{ title: "Danh sách sự kiện", headers, rows }]
        ),
      };
    }
  }

  // 4. TIME TRACKING EXPORT ADAPTER
  private static async exportTimeEntries(
    supabase: any,
    userId: string,
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    let query = supabase
      .from("time_entries")
      .select("*, tasks(title), projects(name)")
      .eq("user_id", userId)
      .order("start_time", { ascending: false })
      .limit(10000);

    if (filters.projectId) query = query.eq("project_id", filters.projectId);
    if (filters.dateFrom) query = query.gte("start_time", filters.dateFrom);
    if (filters.dateTo) query = query.lte("start_time", filters.dateTo);

    const { data: entries, error } = await query;
    if (error) throw new Error("Không thể tải dữ liệu Thời gian.");
    if (!entries || entries.length === 0) throw new Error("Không có bản ghi thời gian phù hợp.");

    const headers = [
      "Mô tả / Task",
      "Dự án",
      "Bắt đầu",
      "Kết thúc",
      "Thời lượng",
      "Billable",
    ];

    const rows = entries.map((e: any) => [
      e.description || e.tasks?.title || "Không có tiêu đề",
      e.projects?.name || "Không thuộc dự án",
      new Date(e.start_time).toLocaleString("vi-VN"),
      e.end_time ? new Date(e.end_time).toLocaleString("vi-VN") : "Đang chạy",
      formatSummaryDuration(e.duration_seconds || 0),
      e.is_billable ? "Có" : "Không",
    ]);

    if (format === "csv") {
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(headers, rows),
      };
    } else if (format === "xlsx") {
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX([{ name: "Nhật ký Thời gian", headers, rows }]),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO THEO DÕI THỜI GIAN (TIME LOGS)",
          [
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
            { label: "Tổng số phiên", value: String(entries.length) },
          ],
          [{ title: "Bảng chi tiết phiên làm việc", headers, rows }]
        ),
      };
    }
  }

  // 5. ANALYTICS EXPORT ADAPTER
  private static async exportAnalytics(
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    const data = await getWeeklyAnalytics(filters.targetWeekIso);

    const summaryBoxes = [
      { label: "Task hoàn thành", value: data.overview.completedTasksCount },
      { label: "Tỷ lệ hoàn thành", value: data.overview.completionRatePct !== null ? `${data.overview.completionRatePct}%` : "N/A" },
      { label: "Tỷ lệ đúng hạn", value: data.overview.onTimeCompletionRatePct !== null ? `${data.overview.onTimeCompletionRatePct}%` : "N/A" },
      { label: "Tổng thời gian", value: formatSummaryDuration(data.overview.totalTimeSeconds) },
      { label: "Thời gian Billable", value: formatSummaryDuration(data.overview.billableTimeSeconds) },
    ];

    const projectHeaders = ["Dự án", "Tiến độ", "Thời gian đã dùng", "Sức khỏe"];
    const projectRows = data.projectPerformance.map((p) => [
      p.name,
      `${p.completionRatePct}%`,
      formatSummaryDuration(p.timeTrackedSeconds),
      p.health,
    ]);

    if (format === "csv") {
      const csvHeaders = ["Chỉ số", "Giá trị"];
      const csvRows = summaryBoxes.map((b) => [b.label, b.value]);
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(csvHeaders, csvRows),
      };
    } else if (format === "xlsx") {
      const sheets: SheetData[] = [
        {
          name: "Tổng quan KPI",
          headers: ["Chỉ số", "Giá trị"],
          rows: summaryBoxes.map((b) => [b.label, b.value]),
        },
        {
          name: "Hiệu suất Dự án",
          headers: projectHeaders,
          rows: projectRows,
        },
      ];
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX(sheets),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          `BÁO CÁO PHÂN TÍCH TUẦN (${data.period.formattedRange})`,
          [
            { label: "Tuần số", value: `Tuần ${data.period.weekNumber} / ${data.period.year}` },
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
          ],
          [
            { title: "Chỉ số KPI Tổng quan", summaryBoxes },
            { title: "Sức khỏe & Hiệu suất Dự án", headers: projectHeaders, rows: projectRows },
          ]
        ),
      };
    }
  }

  // 6. NOTES EXPORT ADAPTER
  private static async exportNotes(
    supabase: any,
    userId: string,
    format: ExportFormat,
    filters: ExportFilterOptions,
    baseFilename: string
  ): Promise<ExportResult> {
    let query = supabase
      .from("notes")
      .select("*, projects(name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10000);

    if (filters.projectId) query = query.eq("project_id", filters.projectId);

    const { data: notes, error } = await query;
    if (error) throw new Error("Không thể tải dữ liệu Ghi chú.");
    if (!notes || notes.length === 0) throw new Error("Không có ghi chú phù hợp.");

    const headers = ["Tiêu đề", "Dự án", "Đã ghim", "Cập nhật lần cuối"];
    const rows = notes.map((n: any) => [
      n.title || "Ghi chú không tên",
      n.projects?.name || "Không thuộc dự án",
      n.is_pinned ? "Có" : "Không",
      new Date(n.updated_at).toLocaleString("vi-VN"),
    ]);

    if (format === "csv") {
      return {
        filename: `${baseFilename}.csv`,
        mimeType: "text/csv; charset=utf-8",
        content: formatAsCSV(headers, rows),
      };
    } else if (format === "xlsx") {
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX([{ name: "Danh sách Ghi chú", headers, rows }]),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO DANH SÁCH GHI CHÚ",
          [
            { label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") },
            { label: "Tổng số ghi chú", value: String(notes.length) },
          ],
          [{ title: "Danh sách Ghi chú cá nhân", headers, rows }]
        ),
      };
    }
  }

  // 7. DASHBOARD EXPORT ADAPTER
  private static async exportDashboard(
    format: ExportFormat,
    baseFilename: string
  ): Promise<ExportResult> {
    const data = await getDashboardData();

    const summaryBoxes = [
      { label: "Công việc hôm nay", value: data.summary.todayTaskCount },
      { label: "Task quá hạn", value: data.summary.overdueTaskCount },
      { label: "Dự án hoạt động", value: data.summary.activeProjectCount },
      { label: "Thời gian hôm nay", value: formatSummaryDuration(data.summary.todayTimeSeconds) },
    ];

    const taskHeaders = ["Tiêu đề", "Trạng thái", "Ưu tiên", "Hạn chót"];
    const taskRows = data.focusTasks.map((t) => [
      t.title,
      t.status,
      t.priority,
      t.due_date ? new Date(t.due_date).toLocaleDateString("vi-VN") : "Khóa mốc",
    ]);

    if (format === "xlsx") {
      const sheets: SheetData[] = [
        {
          name: "Tổng quan Dashboard",
          headers: ["Chỉ số", "Giá trị"],
          rows: summaryBoxes.map((b) => [b.label, b.value]),
        },
        {
          name: "Công việc Tiêu điểm",
          headers: taskHeaders,
          rows: taskRows,
        },
      ];
      return {
        filename: `${baseFilename}.xls`,
        mimeType: "application/vnd.ms-excel; charset=utf-8",
        content: formatAsXLSX(sheets),
      };
    } else {
      return {
        filename: `${baseFilename}.html`,
        mimeType: "text/html; charset=utf-8",
        content: formatAsPDF(
          "BÁO CÁO TỔNG QUAN EXECUTIVE DASHBOARD",
          [{ label: "Ngày xuất", value: new Date().toLocaleDateString("vi-VN") }],
          [
            { title: "Chỉ số điều hành hôm nay", summaryBoxes },
            { title: "Công việc Tiêu điểm (Focus Tasks)", headers: taskHeaders, rows: taskRows },
          ]
        ),
      };
    }
  }
}
