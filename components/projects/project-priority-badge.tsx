import * as React from "react";
import { ProjectPriority } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

interface ProjectPriorityBadgeProps {
  priority: ProjectPriority;
  className?: string;
  showText?: boolean;
}

export function ProjectPriorityBadge({
  priority,
  className,
  showText = true,
}: ProjectPriorityBadgeProps) {
  const config = {
    P0: {
      label: "P0 — Khẩn cấp",
      shortLabel: "P0",
      className: "bg-red-500/20 text-red-400 border-red-500/40 font-semibold",
    },
    P1: {
      label: "P1 — Cao",
      shortLabel: "P1",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/40 font-medium",
    },
    P2: {
      label: "P2 — Bình thường",
      shortLabel: "P2",
      className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    P3: {
      label: "P3 — Thấp",
      shortLabel: "P3",
      className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
  }[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] border transition-colors",
        config.className,
        className
      )}
    >
      {showText ? config.label : config.shortLabel}
    </span>
  );
}
