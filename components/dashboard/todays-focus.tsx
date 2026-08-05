"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, ArrowUpRight, Clock, FolderKanban } from "lucide-react";

import { TaskItem } from "@/lib/tasks/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { EmptyState } from "@/components/ui/empty-state";

interface TodaysFocusProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onOpenCreateTask: () => void;
}

export function TodaysFocus({ tasks, onSelectTask, onOpenCreateTask }: TodaysFocusProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" /> Today's Focus
          </CardTitle>
          <CardDescription className="text-xs">
            Các công việc quan trọng nhất cần giải quyết ngay hôm nay
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/tasks">
            Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {tasks.length === 0 ? (
          <EmptyState
            title="Hôm nay chưa có công việc cần tập trung"
            description="Tạo thêm công việc mới hoặc nghỉ ngơi để nạp năng lượng."
            actionLabel="+ Tạo công việc"
            onAction={onOpenCreateTask}
          />
        ) : (
          tasks.map((task) => {
            const dueDateStr = task.due_date
              ? new Date(task.due_date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : null;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="group flex items-center justify-between p-3 rounded-xl border bg-accent/20 hover:bg-accent/40 cursor-pointer transition-all duration-200"
              >
                <div className="min-w-0 flex-1 space-y-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {task.project && (
                      <span className="flex items-center gap-1 font-medium text-foreground/80 truncate">
                        <FolderKanban
                          className="h-3 w-3 shrink-0"
                          style={{ color: task.project.color || undefined }}
                        />
                        <span className="truncate">{task.project.name}</span>
                      </span>
                    )}

                    {dueDateStr && (
                      <span className="flex items-center gap-1 font-mono text-[11px] shrink-0">
                        <Clock className="h-3 w-3 text-sky-400" />
                        {dueDateStr}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
