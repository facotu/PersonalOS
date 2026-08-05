"use client";

import * as React from "react";
import { TaskItem, TaskStatus } from "@/lib/tasks/types";
import { TaskCard } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";

interface TaskKanbanColumnProps {
  status: TaskStatus;
  title: string;
  count: number;
  tasks: TaskItem[];
  colorClass: string;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onOpenDetail: (task: TaskItem) => void;
  onToggleComplete: (task: TaskItem) => void;
}

export function TaskKanbanColumn({
  status,
  title,
  count,
  tasks,
  colorClass,
  onDropTask,
  onOpenDetail,
  onToggleComplete,
}: TaskKanbanColumnProps) {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col rounded-2xl border bg-card/40 backdrop-blur-md p-3 min-w-[260px] max-w-xs flex-1 transition-all duration-200",
        isOver && "border-primary/80 bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", colorClass)} />
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-muted-foreground border">
          {count}
        </span>
      </div>

      {/* Column Task Cards Stack */}
      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[350px] max-h-[calc(100vh-280px)] pr-1">
        {tasks.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/60 p-4 text-center">
            <span className="text-xs text-muted-foreground">Kéo thả công việc vào đây</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenDetail={onOpenDetail}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}
