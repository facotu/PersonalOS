"use client";

import * as React from "react";
import { Calendar, Flag, CheckCircle2, Clock } from "lucide-react";
import { ProjectItem } from "@/lib/projects/types";
import { TaskItem } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

interface ProjectTimelineProps {
  project: ProjectItem;
  tasks: TaskItem[];
}

export function ProjectTimeline({ project, tasks }: ProjectTimelineProps) {
  const startDate = project.start_date ? new Date(project.start_date) : new Date(project.created_at);
  const deadline = project.deadline ? new Date(project.deadline) : null;

  const now = new Date();

  // Total project duration in days
  let totalDays = 30;
  if (deadline) {
    totalDays = Math.max(1, Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  }

  // Calculate current elapsed percentage
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const timeElapsedPct = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <div className="space-y-6 p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Tiến Độ & Timeline Dự Án
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          Thời lượng: {totalDays} ngày ({elapsedDays} ngày đã trôi qua)
        </span>
      </div>

      {/* Progress & Time Elapsed Visual Bars */}
      <div className="space-y-4">
        {/* Project Task Completion Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Tiến độ hoàn thành công việc
            </span>
            <span className="font-semibold text-foreground">{project.progress_pct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-accent overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${project.progress_pct}%` }}
            />
          </div>
        </div>

        {/* Time Elapsed Progress */}
        {deadline && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sky-400" /> Thời gian dự án đã tiêu tốn
              </span>
              <span className="font-semibold text-foreground">{timeElapsedPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-accent overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  timeElapsedPct > project.progress_pct ? "bg-amber-500" : "bg-sky-500"
                )}
                style={{ width: `${timeElapsedPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Milestones List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Flag className="h-3.5 w-3.5 text-primary" /> Mốc Công Việc Nổi Bật (Milestones)
        </h4>

        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Chưa có công việc nào trong dự án.</p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 8).map((task) => {
              const isDone = task.status === "HOAN_THANH";
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-accent/20 text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        isDone ? "bg-emerald-400" : "bg-amber-400"
                      )}
                    />
                    <span className={cn("font-medium truncate", isDone && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                  </div>

                  {task.due_date && (
                    <span className="text-muted-foreground font-mono shrink-0 pl-2">
                      {new Date(task.due_date).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
