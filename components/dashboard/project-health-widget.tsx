"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, ArrowUpRight, CheckCircle2 } from "lucide-react";

import { DashboardProjectHealthItem } from "@/lib/dashboard/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectHealthBadge } from "@/components/projects/project-health-badge";
import { EmptyState } from "@/components/ui/empty-state";

interface ProjectHealthWidgetProps {
  projects: DashboardProjectHealthItem[];
}

export function ProjectHealthWidget({ projects }: ProjectHealthWidgetProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-sky-400" /> Sức Khỏe Dự Án
          </CardTitle>
          <CardDescription className="text-xs">
            Theo dõi tiến độ & tình trạng các dự án đang triển khai
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/projects">
            Tất cả dự án <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <EmptyState
            title="Tất cả Project đang ổn định"
            description="Chưa có dự án nào cần cảnh báo sức khỏe đặc biệt."
          />
        ) : (
          projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="block p-3 rounded-xl border bg-accent/20 hover:bg-accent/40 transition-all duration-200 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {proj.name}
                </span>
                <ProjectHealthBadge health={proj.health} />
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tiến độ: {proj.progress_pct}%</span>
                  <span>{proj.completed_tasks} đã xong / {proj.active_tasks} còn lại</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${proj.progress_pct}%` }}
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
