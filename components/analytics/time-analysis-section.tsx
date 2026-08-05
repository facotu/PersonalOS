"use client";

import * as React from "react";
import { Clock, DollarSign, FolderKanban } from "lucide-react";
import { DailyTimeDistribution, ProjectTimeDistribution } from "@/lib/analytics/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatSummaryDuration } from "@/components/timer/time-entry-row";

interface TimeAnalysisSectionProps {
  totalSeconds: number;
  billableSeconds: number;
  nonBillableSeconds: number;
  byDay: DailyTimeDistribution[];
  byProject: ProjectTimeDistribution[];
  billablePct: number;
}

export function TimeAnalysisSection({
  totalSeconds,
  billableSeconds,
  nonBillableSeconds,
  byDay,
  byProject,
  billablePct,
}: TimeAnalysisSectionProps) {
  // Compute max daily seconds for bar chart scaling
  const maxDaySecs = Math.max(1, ...byDay.map((d) => d.totalSeconds));

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" /> Phân Tích Thời Gian (Time Analysis)
        </CardTitle>
        <CardDescription className="text-xs">
          Phân bổ thời gian theo ngày, theo dự án và tỷ lệ Billable
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Time Summary Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl border bg-accent/20">
            <span className="text-muted-foreground block text-[11px]">Tổng thời gian</span>
            <span className="text-base font-bold font-mono text-foreground">
              {formatSummaryDuration(totalSeconds)}
            </span>
          </div>
          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
            <span className="text-emerald-400 block text-[11px]">Billable ({billablePct}%)</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {formatSummaryDuration(billableSeconds)}
            </span>
          </div>
          <div className="p-3 rounded-xl border bg-accent/20">
            <span className="text-muted-foreground block text-[11px]">Non-billable</span>
            <span className="text-base font-bold font-mono text-foreground">
              {formatSummaryDuration(nonBillableSeconds)}
            </span>
          </div>
        </div>

        {/* Time by Day Bar Chart */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Thời Gian Theo Ngày (T2 → CN)
          </span>

          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 px-1 border-b pb-2">
            {byDay.map((d, idx) => {
              const heightPct = Math.round((d.totalSeconds / maxDaySecs) * 100);
              const hrs = Number((d.totalSeconds / 3600).toFixed(1));

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-muted-foreground">{hrs > 0 ? `${hrs}h` : ""}</span>
                  <div className="w-full bg-accent/30 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                      title={`${d.dayName}: ${formatSummaryDuration(d.totalSeconds)}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time by Project Top 5 */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5 text-sky-400" /> Thời Gian Theo Dự Án (Top 5)
          </span>

          {byProject.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Chưa có dữ liệu thời gian theo dự án.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {byProject.map((proj, idx) => {
                const projPct = totalSeconds > 0 ? Math.round((proj.totalSeconds / totalSeconds) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {proj.projectName}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {formatSummaryDuration(proj.totalSeconds)} ({projPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{
                          width: `${projPct}%`,
                          backgroundColor: proj.color || undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
