import * as React from "react";
import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { ProjectHealthStatus } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

interface ProjectHealthBadgeProps {
  health?: ProjectHealthStatus;
  className?: string;
}

export function ProjectHealthBadge({ health = "GOOD", className }: ProjectHealthBadgeProps) {
  const config = {
    GOOD: {
      label: "Tốt",
      icon: CheckCircle2,
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    RISK: {
      label: "Có rủi ro",
      icon: AlertTriangle,
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    DELAYED: {
      label: "Đang chậm",
      icon: Clock,
      className: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    },
    OVERDUE: {
      label: "Quá hạn",
      icon: XCircle,
      className: "bg-rose-500/20 text-rose-400 border-rose-500/40 font-semibold animate-pulse",
    },
  }[health];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
}
