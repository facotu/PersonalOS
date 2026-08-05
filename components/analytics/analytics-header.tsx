"use client";

import * as React from "react";
import { BarChart3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyAnalyticsPeriod } from "@/lib/analytics/types";

interface AnalyticsHeaderProps {
  period: WeeklyAnalyticsPeriod;
  onNavigateWeek: (direction: "prev" | "current" | "next") => void;
}

export function AnalyticsHeader({ period, onNavigateWeek }: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" /> Phân Tích Tuần (Weekly Analytics)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Báo cáo hiệu suất công việc, phân bổ thời gian và tỷ lệ hoàn thành theo tuần
        </p>
      </div>

      {/* Week Selector Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 border rounded-xl p-1 bg-card/60 backdrop-blur-md shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateWeek("prev")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Tuần trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant={period.isCurrentWeek ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onNavigateWeek("current")}
            className="h-8 px-3 text-xs font-semibold"
          >
            Tuần này
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateWeek("next")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Tuần sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="font-mono text-sm font-bold text-foreground border bg-accent/30 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" />
          {period.weekLabel}
        </span>
      </div>
    </div>
  );
}
