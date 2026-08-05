"use client";

import * as React from "react";
import { Circle, SquareCheck, Diamond } from "lucide-react";
import { UnifiedCalendarItem } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

interface CalendarItemChipProps {
  item: UnifiedCalendarItem;
  onClickItem: (item: UnifiedCalendarItem) => void;
  className?: string;
  compact?: boolean;
}

export function CalendarItemChip({
  item,
  onClickItem,
  className,
  compact = false,
}: CalendarItemChipProps) {
  const isEvent = item.kind === "event";
  const isTask = item.kind === "task";
  const isProject = item.kind === "project_deadline";

  const isCompleted = item.status === "HOAN_THANH" || item.status === "Completed";

  const renderIcon = () => {
    if (isEvent) {
      return <Circle className="h-2.5 w-2.5 fill-current text-sky-400 shrink-0" />;
    }
    if (isTask) {
      return <SquareCheck className="h-3 w-3 text-emerald-400 shrink-0" />;
    }
    return <Diamond className="h-2.5 w-2.5 fill-current text-purple-400 shrink-0" />;
  };

  const formattedTime = !item.is_all_day
    ? new Date(item.start_time).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Cả ngày";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClickItem(item);
      }}
      className={cn(
        "group w-full flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs text-left font-medium transition-all hover:scale-[1.01] active:scale-[0.99] truncate shadow-xs",
        isEvent && "bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20",
        isTask && "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20",
        isProject && "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20",
        isCompleted && "line-through opacity-60",
        className
      )}
    >
      {renderIcon()}
      <span className="truncate flex-1 leading-snug">{item.title}</span>
      {!compact && !item.is_all_day && (
        <span className="text-[10px] opacity-75 font-mono shrink-0 ml-auto">{formattedTime}</span>
      )}
    </button>
  );
}
