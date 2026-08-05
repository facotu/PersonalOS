"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Clock, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { WeeklyOverviewKPI } from "@/lib/analytics/types";
import { formatSummaryDuration } from "@/components/timer/time-entry-row";

interface WeeklyOverviewKPIProps {
  overview: WeeklyOverviewKPI;
}

export function WeeklyOverviewKPISection({ overview }: WeeklyOverviewKPIProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Completed Tasks */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Task Hoàn Thành
        </span>
        <div className="text-2xl font-bold font-mono text-foreground">
          {overview.completedTasks}
        </div>
      </div>

      {/* 2. Completion Rate */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          Tỷ Lệ Hoàn Thành
        </span>
        <div className="text-2xl font-bold font-mono text-primary">
          {overview.completionRatePct !== null ? `${overview.completionRatePct}%` : "N/A"}
        </div>
      </div>

      {/* 3. On-Time Rate */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          Đúng Hạn
        </span>
        <div className="text-2xl font-bold font-mono text-sky-400">
          {overview.onTimeRatePct !== null ? `${overview.onTimeRatePct}%` : "N/A"}
        </div>
      </div>

      {/* 4. Overdue Tasks */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400" /> Quá Hạn
        </span>
        <div className="text-2xl font-bold font-mono text-rose-400">
          {overview.overdueTasks}
        </div>
      </div>

      {/* 5. Total Time */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-indigo-400" /> Tổng Thời Gian
        </span>
        <div className="text-2xl font-bold font-mono text-foreground">
          {formatSummaryDuration(overview.totalTimeSeconds)}
        </div>
        {overview.totalTimeDiffPct !== null && (
          <span className="text-[10px] font-semibold flex items-center gap-0.5 text-sky-400">
            {overview.totalTimeDiffPct >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(overview.totalTimeDiffPct)}% so với tuần trước
          </span>
        )}
      </div>

      {/* 6. Billable Time */}
      <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1">
        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Billable
        </span>
        <div className="text-2xl font-bold font-mono text-emerald-400">
          {formatSummaryDuration(overview.billableTimeSeconds)}
        </div>
      </div>
    </div>
  );
}
