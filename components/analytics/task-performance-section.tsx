"use client";

import * as React from "react";
import { CheckSquare } from "lucide-react";
import { TaskPerformanceData } from "@/lib/analytics/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface TaskPerformanceSectionProps {
  data: TaskPerformanceData;
}

export function TaskPerformanceSection({ data }: TaskPerformanceSectionProps) {
  const totalStatus =
    data.statusDistribution.CHUA_LAM +
    data.statusDistribution.DANG_LAM +
    data.statusDistribution.CHO +
    data.statusDistribution.HOAN_THANH +
    data.statusDistribution.HUY;

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary" /> Hiệu Suất Công Việc (Task Performance)
        </CardTitle>
        <CardDescription className="text-xs">
          Phân bổ trạng thái và độ ưu tiên của các công việc trong tuần
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Overview */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl border bg-accent/20">
            <span className="text-muted-foreground block text-[11px]">Đã tạo</span>
            <span className="text-base font-bold font-mono text-foreground">{data.createdCount}</span>
          </div>
          <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
            <span className="text-emerald-400 block text-[11px]">Đã xong</span>
            <span className="text-base font-bold font-mono text-emerald-400">{data.completedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/30">
            <span className="text-rose-400 block text-[11px]">Quá hạn</span>
            <span className="text-base font-bold font-mono text-rose-400">{data.overdueCount}</span>
          </div>
          <div className="p-2.5 rounded-xl border bg-accent/20">
            <span className="text-muted-foreground block text-[11px]">Còn tồn</span>
            <span className="text-base font-bold font-mono text-foreground">{data.remainingCount}</span>
          </div>
        </div>

        {/* Status Distribution Progress */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Phân Bổ Trạng Thái
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span>Đang làm ({data.statusDistribution.DANG_LAM})</span>
              <span className="font-mono text-muted-foreground">
                {totalStatus > 0 ? Math.round((data.statusDistribution.DANG_LAM / totalStatus) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full"
                style={{
                  width: `${totalStatus > 0 ? (data.statusDistribution.DANG_LAM / totalStatus) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span>Hoàn thành ({data.statusDistribution.HOAN_THANH})</span>
              <span className="font-mono text-muted-foreground">
                {totalStatus > 0 ? Math.round((data.statusDistribution.HOAN_THANH / totalStatus) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: `${totalStatus > 0 ? (data.statusDistribution.HOAN_THANH / totalStatus) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Phân Bổ Độ Ưu Tiên
          </span>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg border bg-rose-500/10 border-rose-500/30">
              <span className="font-bold text-rose-400">P0</span>
              <span className="block text-foreground font-mono font-bold mt-0.5">{data.priorityDistribution.P0}</span>
            </div>
            <div className="p-2 rounded-lg border bg-amber-500/10 border-amber-500/30">
              <span className="font-bold text-amber-400">P1</span>
              <span className="block text-foreground font-mono font-bold mt-0.5">{data.priorityDistribution.P1}</span>
            </div>
            <div className="p-2 rounded-lg border bg-sky-500/10 border-sky-500/30">
              <span className="font-bold text-sky-400">P2</span>
              <span className="block text-foreground font-mono font-bold mt-0.5">{data.priorityDistribution.P2}</span>
            </div>
            <div className="p-2 rounded-lg border bg-accent/30">
              <span className="font-bold text-muted-foreground">P3</span>
              <span className="block text-foreground font-mono font-bold mt-0.5">{data.priorityDistribution.P3}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
