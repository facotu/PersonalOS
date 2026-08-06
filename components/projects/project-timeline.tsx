"use client";

import * as React from "react";
import { Calendar, Flag, CheckCircle2, Clock, BarChart2, List, AlertCircle } from "lucide-react";
import { ProjectItem } from "@/lib/projects/types";
import { TaskItem } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

interface ProjectTimelineProps {
  project: ProjectItem;
  tasks: TaskItem[];
}

export function ProjectTimeline({ project, tasks }: ProjectTimelineProps) {
  const [viewMode, setViewMode] = React.useState<"gantt" | "list">("gantt");

  // Lấy mốc thời gian bắt đầu và kết thúc tổng thể
  const projStart = project.start_date ? new Date(project.start_date) : new Date(project.created_at);
  const projEnd = project.deadline ? new Date(project.deadline) : new Date(projStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Xác định khoảng thời gian vẽ Gantt (bao phủ cả dự án và các task)
  let minTime = projStart.getTime();
  let maxTime = projEnd.getTime();

  // Điều chỉnh min/max time dựa trên các task để Gantt không bị tràn
  tasks.forEach((task) => {
    if (task.start_date) {
      minTime = Math.min(minTime, new Date(task.start_date).getTime());
    }
    if (task.due_date) {
      maxTime = Math.max(maxTime, new Date(task.due_date).getTime());
    }
  });

  // Đảm bảo maxTime lớn hơn minTime
  if (maxTime <= minTime) {
    maxTime = minTime + 30 * 24 * 60 * 60 * 1000; // Mặc định 30 ngày
  }

  const totalDuration = maxTime - minTime;
  const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 3600 * 24)));

  // Tạo các mốc thời gian trục ngang (chia làm 5 mốc phân bố đều)
  const gridTicks = Array.from({ length: 5 }).map((_, i) => {
    const time = minTime + (totalDuration * i) / 4;
    const date = new Date(time);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  });

  const now = new Date();
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - projStart.getTime()) / (1000 * 3600 * 24)));
  const timeElapsedPct = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  // Lọc các task có cấu hình ngày để đưa lên Gantt
  const ganttTasks = tasks.filter((t) => t.start_date || t.due_date);

  return (
    <div className="space-y-6 p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Tiến Độ & Timeline Dự Án
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thời lượng tổng thể: {totalDays} ngày ({Math.max(0, Math.ceil((now.getTime() - minTime) / (1000 * 3600 * 24)))} ngày đã qua)
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-accent/40 rounded-lg p-0.5 text-xs border">
          <button
            onClick={() => setViewMode("gantt")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all",
              viewMode === "gantt"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" /> Gantt Chart
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all",
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" /> Mốc Milestone
          </button>
        </div>
      </div>

      {/* Progress & Time Elapsed Visual Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* VIEW: GANTT CHART */}
      {viewMode === "gantt" && (
        <div className="space-y-4 pt-2">
          {ganttTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Không có dữ liệu Gantt</p>
              <p className="max-w-xs mx-auto">
                Vui lòng chỉnh sửa các công việc và đặt Ngày bắt đầu & Hạn chót để hiển thị Gantt Chart.
              </p>
            </div>
          ) : (
            <div className="border rounded-xl bg-accent/15 overflow-x-auto">
              <div className="min-w-[650px] p-4 space-y-3">
                {/* Gantt Header (Timeline axis) */}
                <div className="grid grid-cols-[180px_1fr] items-center gap-2 pb-2 border-b border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Công việc (Tasks)</span>
                  <div className="grid grid-cols-5 text-center text-[10px] font-mono text-muted-foreground font-semibold">
                    {gridTicks.map((tick, idx) => (
                      <span key={idx}>{tick}</span>
                    ))}
                  </div>
                </div>

                {/* Gantt Rows */}
                <div className="space-y-2 pt-1 relative">
                  {/* Vertical grid lines helper */}
                  <div className="absolute inset-0 grid grid-cols-[180px_1fr] gap-2 pointer-events-none -z-10">
                    <div />
                    <div className="grid grid-cols-5 h-full border-l border-r border-border/20">
                      <div className="border-r border-border/20 h-full" />
                      <div className="border-r border-border/20 h-full" />
                      <div className="border-r border-border/20 h-full" />
                      <div className="border-r border-border/20 h-full" />
                    </div>
                  </div>

                  {ganttTasks.map((task) => {
                    const taskStart = task.start_date ? new Date(task.start_date).getTime() : minTime;
                    const taskEnd = task.due_date ? new Date(task.due_date).getTime() : maxTime;

                    // Tính phần trăm vị trí ngang
                    const leftPct = Math.max(0, Math.min(100, ((taskStart - minTime) / totalDuration) * 100));
                    const widthPct = Math.max(2, Math.min(100 - leftPct, ((taskEnd - taskStart) / totalDuration) * 100));

                    const isDone = task.status === "HOAN_THANH";
                    const isOverdue = task.due_date && new Date(task.due_date) < now && !isDone;

                    return (
                      <div key={task.id} className="grid grid-cols-[180px_1fr] items-center gap-2 py-1">
                        {/* Task Title label */}
                        <span className={cn("text-xs font-semibold truncate pr-2 text-foreground/80", isDone && "line-through text-muted-foreground")} title={task.title}>
                          {task.title}
                        </span>

                        {/* Gantt Bar Area */}
                        <div className="relative h-6 bg-accent/25 rounded-md overflow-hidden flex items-center">
                          <div
                            className={cn(
                              "absolute h-full rounded-md shadow-sm transition-all duration-300 border",
                              isDone
                                ? "bg-emerald-500/20 border-emerald-500/50"
                                : isOverdue
                                ? "bg-red-500/20 border-red-500/50 animate-pulse"
                                : "bg-primary/25 border-primary/50"
                            )}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            title={`${task.title}: ${new Date(taskStart).toLocaleDateString("vi-VN")} - ${new Date(taskEnd).toLocaleDateString("vi-VN")}`}
                          >
                            <span
                              className={cn(
                                "absolute left-2 top-1 text-[9px] font-bold tracking-wide truncate max-w-full block select-none",
                                isDone ? "text-emerald-400" : isOverdue ? "text-red-400" : "text-primary"
                              )}
                            >
                              {isDone ? "Đã xong" : isOverdue ? "Quá hạn" : "Đang làm"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: MILESTONES LIST */}
      {viewMode === "list" && (
        <div className="space-y-3 pt-2 animate-in fade-in-30">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Flag className="h-3.5 w-3.5 text-primary" /> Mốc Công Việc Nổi Bật (Milestones)
          </h4>

          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Chưa có công việc nào trong dự án.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
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
      )}
    </div>
  );
}
