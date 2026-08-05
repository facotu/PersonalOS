import * as React from "react";
import { ProjectStatus } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = {
    Planning: {
      label: "Chưa bắt đầu",
      className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    },
    Active: {
      label: "Đang thực hiện",
      className: "bg-sky-500/15 text-sky-400 border-sky-500/30 font-medium",
    },
    Paused: {
      label: "Tạm dừng",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    Completed: {
      label: "Hoàn thành",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    Archived: {
      label: "Đã lưu trữ",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
  }[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
