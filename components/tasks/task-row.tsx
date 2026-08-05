"use client";

import * as React from "react";
import { Calendar, Tag as TagIcon, FolderKanban, Check, MoreVertical, Trash2, Edit3 } from "lucide-react";

import { TaskItem } from "@/lib/tasks/types";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: TaskItem;
  onToggleComplete: (task: TaskItem) => void;
  onOpenDetail: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskRow({
  task,
  onToggleComplete,
  onOpenDetail,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const isCompleted = task.status === "HOAN_THANH";

  // Due Date Formatting & Overdue Calculation
  let formattedDueDate: string | null = null;
  let isOverdue = false;
  let isToday = false;

  if (task.due_date) {
    const due = new Date(task.due_date);
    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    formattedDueDate = due.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    if (!isCompleted && due < now) {
      isOverdue = true;
    } else if (!isCompleted && due <= todayEnd) {
      isToday = true;
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-md hover:bg-accent/40 transition-all duration-200 shadow-sm",
        isCompleted && "opacity-60 bg-accent/20"
      )}
    >
      {/* Left: Checkbox & Main Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Completion Checkbox Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
              : "border-input bg-background hover:border-primary"
          )}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        {/* Title & Metadata */}
        <div
          onClick={() => onOpenDetail(task)}
          className="min-w-0 flex-1 cursor-pointer space-y-1"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-medium text-sm text-foreground transition-colors group-hover:text-primary",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </span>

            {/* Priority Badge */}
            <TaskPriorityBadge priority={task.priority} showText={false} />
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {/* Project */}
            {task.project && (
              <span className="flex items-center gap-1 font-medium text-foreground/80">
                <FolderKanban
                  className="h-3 w-3"
                  style={{ color: task.project.color || undefined }}
                />
                {task.project.name}
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {task.tags.map((t) => `#${t.name}`).join(" ")}
              </span>
            )}

            {/* Due Date Indicator */}
            {formattedDueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  isOverdue && "text-red-400 font-semibold",
                  isToday && "text-amber-400"
                )}
              >
                <Calendar className="h-3 w-3" />
                {isOverdue ? `Quá hạn (${formattedDueDate})` : isToday ? "Hôm nay" : formattedDueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status Badge & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <TaskStatusBadge status={task.status} />

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Xóa công việc"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
