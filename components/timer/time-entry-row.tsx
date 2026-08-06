"use client";

import * as React from "react";
import { Clock, FolderKanban, CheckSquare, DollarSign, Edit3, Trash2, Star } from "lucide-react";

import { TimeEntryItem } from "@/lib/time/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeEntryRowProps {
  entry: TimeEntryItem;
  onEdit: (entry: TimeEntryItem) => void;
  onDelete: (entry: TimeEntryItem) => void;
}

/**
 * Format helper for Timesheet rows: "5 phút", "1 giờ 27 phút", "8 giờ 12 phút"
 */
export function formatVietnameseDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 phút";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} phút`;
  }
  if (minutes === 0) {
    return `${hours} giờ`;
  }
  return `${hours} giờ ${minutes} phút`;
}

/**
 * Format helper for Summary Cards: "06h 42m"
 */
export function formatSummaryDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}h ${mm}m`;
}

export function TimeEntryRow({ entry, onEdit, onDelete }: TimeEntryRowProps) {
  const startDate = new Date(entry.started_at);
  const endDate = entry.ended_at ? new Date(entry.ended_at) : null;

  const timeRangeStr = `${startDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} — ${
    endDate
      ? endDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "Đang chạy..."
  }`;

  return (
    <div className="group flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-md hover:bg-accent/40 transition-all duration-200 shadow-sm">
      {/* Left: Task / Project / Description info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {entry.task?.title || entry.description || "Bản ghi thời gian không tên"}
          </span>

          {entry.is_billable && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <DollarSign className="h-3 w-3" /> Billable
            </span>
          )}

          {entry.focus_score !== null && entry.focus_score !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                entry.focus_score >= 8
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : entry.focus_score >= 5
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
              title={`Điểm tập trung: ${entry.focus_score}/10`}
            >
              <Star className="h-3 w-3" /> {entry.focus_score}/10
            </span>
          )}
        </div>

        {/* Relations & Time Range */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {entry.project && (
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <FolderKanban
                className="h-3 w-3"
                style={{ color: entry.project.color || undefined }}
              />
              {entry.project.name}
            </span>
          )}

          <span className="flex items-center gap-1 font-mono">
            <Clock className="h-3 w-3 text-sky-400" />
            {timeRangeStr}
          </span>
        </div>
      </div>

      {/* Right: Duration & Actions */}
      <div className="flex items-center space-x-3 shrink-0">
        <span className="font-bold text-sm text-primary font-mono bg-accent/40 px-2.5 py-1 rounded-lg border">
          {formatVietnameseDuration(entry.duration_seconds)}
        </span>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(entry)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(entry)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Xóa bản ghi"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
