import * as React from "react";
import { TaskStatus } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = {
    CHUA_LAM: {
      label: "Chưa làm",
      className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    },
    DANG_LAM: {
      label: "Đang làm",
      className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    CHO: {
      label: "Chờ",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    HOAN_THANH: {
      label: "Hoàn thành",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    HUY: {
      label: "Đã hủy",
      className: "bg-rose-500/15 text-rose-400 border-rose-500/30 line-through opacity-70",
    },
  }[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
