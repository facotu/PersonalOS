"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { ProjectPerformanceData, DeadlinePerformanceData } from "@/lib/analytics/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProjectHealthBadge } from "@/components/projects/project-health-badge";
import { formatSummaryDuration } from "@/components/timer/time-entry-row";

interface ProjectPerformanceSectionProps {
  projects: ProjectPerformanceData[];
  deadlinePerformance: DeadlinePerformanceData;
}

export function ProjectPerformanceSection({
  projects,
  deadlinePerformance,
}: ProjectPerformanceSectionProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-sky-400" /> Hiệu Suất Dự Án & Deadline
        </CardTitle>
        <CardDescription className="text-xs">
          Đánh giá tình trạng hoàn thành các mốc hạn chót và sức khỏe dự án
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deadline Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
            <span className="text-emerald-400 block text-[11px]">Đúng hạn</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {deadlinePerformance.onTimeCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border bg-amber-500/10 border-amber-500/30">
            <span className="text-amber-400 block text-[11px]">Trễ hạn</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {deadlinePerformance.lateCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/30">
            <span className="text-rose-400 block text-[11px]">Chưa xong</span>
            <span className="text-base font-bold font-mono text-rose-400">
              {deadlinePerformance.unfinishedCount}
            </span>
          </div>
        </div>

        {/* Active Projects List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sức Khỏe Dự Án Đang Hoạt Động
          </span>

          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Chưa có dự án nào hoạt động trong tuần.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="block p-3 rounded-xl border bg-accent/20 hover:bg-accent/40 transition-all text-xs space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {proj.name}
                    </span>
                    <ProjectHealthBadge health={proj.health} />
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Tiến độ: {proj.completionRatePct}%</span>
                    <span>Thời gian: {formatSummaryDuration(proj.timeTrackedSeconds)}</span>
                  </div>

                  <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${proj.completionRatePct}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
