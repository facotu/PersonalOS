import * as React from "react";
import { CalendarEventType } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

interface CalendarEventTypeBadgeProps {
  type: CalendarEventType;
  className?: string;
}

export function CalendarEventTypeBadge({ type, className }: CalendarEventTypeBadgeProps) {
  const config = {
    Meeting: {
      label: "Cuộc họp",
      className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    Task: {
      label: "Công việc",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    Personal: {
      label: "Cá nhân",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    Reminder: {
      label: "Nhắc nhở",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
  }[type] || {
    label: type,
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
