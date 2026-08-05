"use client";

import * as React from "react";
import { Calendar, Tag as TagIcon, FolderKanban, Check } from "lucide-react";

import { TaskItem } from "@/lib/tasks/types";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskItem;
  onOpenDetail: (task: TaskItem) => void;
  onToggleComplete: (task: TaskItem) => void;
}

export function TaskCard({ task, onOpenDetail, onToggleComplete }: TaskCardProps) {
  const isCompleted = task.status === "HOAN_THANH";

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDetail(task)}
      className={cn(
        "group cursor-grab active:cursor-grabbing p-3.5 rounded-xl border bg-card/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/50 transition-all space-y-2.5 relative",
        isCompleted && "opacity-60 bg-accent/20"
      )}
    >
      {/* Top Header: Priority Badge & Quick Complete */}
      <div className="flex items-center justify-between gap-2">
        <TaskPriorityBadge priority={task.priority} showText={false} />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
        </button>
      </div>

      {/* Task Title */}
      <h4
        className={cn(
          "font-medium text-sm text-foreground leading-snug line-clamp-2",
          isCompleted && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </h4>

      {/* Metadata Badges */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-2 truncate">
          {task.project && (
            <span className="flex items-center gap-1 font-medium text-foreground/80 truncate">
              <FolderKanban
                className="h-3 w-3 shrink-0"
                style={{ color: task.project.color || undefined }}
              />
              <span className="truncate">{task.project.name}</span>
            </span>
          )}

          {task.tags && task.tags.length > 0 && (
            <span className="flex items-center gap-0.5 truncate">
              <TagIcon className="h-3 w-3 shrink-0" />
              #{task.tags[0].name}
            </span>
          )}
        </div>

        {task.due_date && (
          <span className="flex items-center gap-1 shrink-0 font-medium">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
