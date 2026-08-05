"use client";

import * as React from "react";
import { TaskItem, TaskStatus } from "@/lib/tasks/types";
import { TaskKanbanColumn } from "@/components/tasks/task-kanban-column";

interface TaskKanbanProps {
  tasks: TaskItem[];
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onOpenDetail: (task: TaskItem) => void;
  onToggleComplete: (task: TaskItem) => void;
}

const columnsConfig: Array<{
  status: TaskStatus;
  title: string;
  colorClass: string;
}> = [
  { status: "CHUA_LAM", title: "Chưa làm", colorClass: "bg-slate-400" },
  { status: "DANG_LAM", title: "Đang làm", colorClass: "bg-sky-500" },
  { status: "CHO", title: "Chờ", colorClass: "bg-amber-500" },
  { status: "HOAN_THANH", title: "Hoàn thành", colorClass: "bg-emerald-500" },
  { status: "HUY", title: "Đã hủy", colorClass: "bg-rose-500" },
];

export function TaskKanban({
  tasks,
  onDropTask,
  onOpenDetail,
  onToggleComplete,
}: TaskKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
      {columnsConfig.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <TaskKanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            count={columnTasks.length}
            tasks={columnTasks}
            colorClass={col.colorClass}
            onDropTask={onDropTask}
            onOpenDetail={onOpenDetail}
            onToggleComplete={onToggleComplete}
          />
        );
      })}
    </div>
  );
}
