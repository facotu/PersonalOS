export type ExportResource =
  | "tasks"
  | "projects"
  | "calendar"
  | "time"
  | "analytics"
  | "notes"
  | "dashboard";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportFilterOptions {
  dateFrom?: string;
  dateTo?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  targetWeekIso?: string;
  searchQuery?: string;
}

export interface ExportRequestPayload {
  resource: ExportResource;
  format: ExportFormat;
  filters?: ExportFilterOptions;
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  content: string | Buffer;
}
