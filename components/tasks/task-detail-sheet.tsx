"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  FolderKanban,
  Tag as TagIcon,
  Check,
  Edit3,
  Trash2,
  Zap,
} from "lucide-react";

import { TaskItem } from "@/lib/tasks/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { Button } from "@/components/ui/button";

interface TaskDetailSheetProps {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskDetailSheetProps) {
  if (!task) return null;

  const isCompleted = task.status === "HOAN_THANH";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
        <SheetHeader className="pb-4 border-b space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
          <SheetTitle className="text-xl font-bold leading-snug">{task.title}</SheetTitle>
          <SheetDescription className="text-xs">
            Khởi tạo ngày {new Date(task.created_at).toLocaleDateString("vi-VN")}
          </SheetDescription>
        </SheetHeader>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
            onClick={() => onToggleComplete(task)}
            className="flex-1 gap-1.5"
          >
            <Check className="h-4 w-4" />
            {isCompleted ? "Đánh dấu Chưa hoàn thành" : "Hoàn Thành Công Việc"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
            className="gap-1.5"
          >
            <Edit3 className="h-4 w-4" /> Chỉnh sửa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(task)}
            className="text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Xóa
          </Button>
        </div>

        {/* Description Section */}
        {task.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mô tả chi tiết
            </h4>
            <div className="p-3 rounded-xl border bg-accent/30 text-sm whitespace-pre-wrap leading-relaxed">
              {task.description}
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Thông tin bổ sung
          </h4>

          <div className="grid grid-cols-1 gap-2.5 text-sm">
            {/* Project */}
            {task.project && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <FolderKanban className="h-4 w-4" /> Dự án
                </span>
                <span className="font-medium text-foreground">{task.project.name}</span>
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Calendar className="h-4 w-4" /> Hạn chót
                </span>
                <span className="font-medium text-foreground">
                  {new Date(task.due_date).toLocaleString("vi-VN")}
                </span>
              </div>
            )}

            {/* Hours */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="h-4 w-4" /> Dự kiến / Thực tế
              </span>
              <span className="font-medium text-foreground">
                {task.estimated_hours}h / {task.actual_hours}h
              </span>
            </div>

            {/* Energy Level */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Zap className="h-4 w-4" /> Năng lượng yêu cầu
              </span>
              <span className="font-medium text-foreground capitalize">
                {task.energy_level}
              </span>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card gap-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs shrink-0">
                  <TagIcon className="h-4 w-4" /> Thẻ (Tags)
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {task.tags.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border"
                      style={{
                        borderColor: `${t.color || "#64748b"}40`,
                        backgroundColor: `${t.color || "#64748b"}15`,
                        color: t.color || "#ffffff",
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
