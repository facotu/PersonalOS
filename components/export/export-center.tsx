"use client";

import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  Filter,
  Layers,
  FolderKanban,
  Clock,
  BarChart3,
  StickyNote,
  LayoutDashboard,
} from "lucide-react";

import { ExportResource, ExportFormat } from "@/lib/export/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function ExportCenter() {
  const [resource, setResource] = React.useState<ExportResource>("tasks");
  const [format, setFormat] = React.useState<ExportFormat>("xlsx");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Smart Format options matrix based on active resource
  const isCSVAllowed = resource !== "dashboard";

  // Auto switch format if CSV selected on dashboard
  React.useEffect(() => {
    if (resource === "dashboard" && format === "csv") {
      setFormat("xlsx");
    }
  }, [resource, format]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        resource,
        format,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(status && { status }),
      });

      const res = await fetch(`/api/export?${params.toString()}`);

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Không thể xuất file.");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `personal-os-${resource}.${format === "xlsx" ? "xls" : format === "pdf" ? "html" : "csv"}`;

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Download file in browser
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Xuất dữ liệu thành công!",
        description: `Tập tin ${filename} đã được tải về thiết bị của bạn.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể xuất dữ liệu",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Download className="h-7 w-7 text-primary" /> Trung Tâm Xuất Dữ Liệu (Export Center)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xuất báo cáo và dữ liệu cá nhân theo định dạng CSV, Excel (XLSX) và PDF
          </p>
        </div>
      </div>

      <form onSubmit={handleExport} className="max-w-4xl space-y-6">
        {/* 1. Select Resource */}
        <Card className="bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> 1. Chọn Nguồn Dữ Liệu (Data Resource)
            </CardTitle>
            <CardDescription className="text-xs">
              Chọn dữ liệu cá nhân bạn muốn trích xuất từ Personal OS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "tasks", label: "Công việc (Tasks)", icon: CheckCircle2 },
                { id: "projects", label: "Dự án (Projects)", icon: FolderKanban },
                { id: "calendar", label: "Lịch (Calendar)", icon: CalendarIcon },
                { id: "time", label: "Thời gian (Time)", icon: Clock },
                { id: "analytics", label: "Phân tích Tuần", icon: BarChart3 },
                { id: "notes", label: "Ghi chú (Notes)", icon: StickyNote },
                { id: "dashboard", label: "Dashboard Summary", icon: LayoutDashboard },
              ].map((item) => {
                const Icon = item.icon;
                const active = resource === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResource(item.id as ExportResource)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold gap-2 transition-all cursor-pointer text-center",
                      active
                        ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-sm"
                        : "bg-accent/20 border-border/60 hover:bg-accent/40 text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Select Format */}
        <Card className="bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" /> 2. Chọn Định Dạng Export (Format)
            </CardTitle>
            <CardDescription className="text-xs">
              Định dạng sẽ tương thích tốt với Microsoft Excel, Google Sheets hoặc In ấn PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CSV */}
              <button
                type="button"
                disabled={!isCSVAllowed}
                onClick={() => setFormat("csv")}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-xl border text-left transition-all cursor-pointer",
                  !isCSVAllowed && "opacity-40 cursor-not-allowed",
                  format === "csv" && isCSVAllowed
                    ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                    : "bg-accent/20 border-border/60 hover:bg-accent/40"
                )}
              >
                <FileCode className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block">CSV (.csv)</span>
                  <span className="text-[11px] text-muted-foreground block leading-tight">
                    UTF-8 BOM Tiếng Việt. Phù hợp xử lý dữ liệu thô.
                  </span>
                </div>
              </button>

              {/* XLSX */}
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-xl border text-left transition-all cursor-pointer",
                  format === "xlsx"
                    ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                    : "bg-accent/20 border-border/60 hover:bg-accent/40"
                )}
              >
                <FileSpreadsheet className="h-6 w-6 shrink-0 mt-0.5 text-emerald-400" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block text-emerald-400">Excel (.xlsx)</span>
                  <span className="text-[11px] text-muted-foreground block leading-tight">
                    Bảng tính có màu Header, Auto-width & Multiple Worksheets.
                  </span>
                </div>
              </button>

              {/* PDF */}
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-xl border text-left transition-all cursor-pointer",
                  format === "pdf"
                    ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                    : "bg-accent/20 border-border/60 hover:bg-accent/40"
                )}
              >
                <FileText className="h-6 w-6 shrink-0 mt-0.5 text-sky-400" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block text-sky-400">Báo cáo PDF (.pdf / HTML)</span>
                  <span className="text-[11px] text-muted-foreground block leading-tight">
                    Báo cáo in ấn A4 chuyên nghiệp, chuẩn Tiếng Việt Unicode.
                  </span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Filters */}
        <Card className="bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" /> 3. Bộ Lọc Phạm Vi Xuất (Optional Filters)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-muted-foreground">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-accent/30 px-3 text-xs focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-muted-foreground">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-accent/30 px-3 text-xs focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Export */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isExporting}
            className="gap-2 font-bold shadow-lg min-w-[200px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Đang Tạo Tập Tin...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" /> Xuất Tập Tin
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
