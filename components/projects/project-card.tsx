"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, CheckSquare, MoreVertical, Edit3, Archive, Trash2, FolderKanban } from "lucide-react";

import { ProjectItem } from "@/lib/projects/types";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectHealthBadge } from "@/components/projects/project-health-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectItem;
  onEdit: (project: ProjectItem) => void;
  onArchive: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const isCompleted = project.status === "Completed";
  const isArchived = project.status === "Archived";

  const totalTasks = project.total_tasks_count || 0;
  const completedTasks = project.completed_tasks_count || 0;
  const progressPct = project.progress_pct || 0;

  // Deadline calculation
  let formattedDeadline: string | null = null;
  let isOverdue = false;
  if (project.deadline) {
    const due = new Date(project.deadline);
    formattedDeadline = due.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!isCompleted && !isArchived && due < new Date()) {
      isOverdue = true;
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 space-y-4",
        isArchived && "opacity-60 bg-accent/20"
      )}
    >
      {/* Top Header: Title, Priority, Health, Status */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color || "#3b82f6" }}
            />
            <Link
              href={`/projects/${project.id}`}
              className="font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {project.name}
            </Link>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <ProjectPriorityBadge priority={project.priority} showText={false} />
            <ProjectHealthBadge health={project.health} />
          </div>
        </div>

        {/* Short Goal / Description */}
        {(project.goal || project.description) && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.goal || project.description}
          </p>
        )}
      </div>

      {/* Progress & Task Summary Section */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5 text-primary" />
            {completedTasks} / {totalTasks} công việc
          </span>
          <span className="text-foreground font-semibold">{progressPct}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressPct === 100
                ? "bg-emerald-500"
                : isOverdue
                ? "bg-rose-500"
                : "bg-primary"
            )}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>

      {/* Footer: Deadline & Action Buttons */}
      <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
        {formattedDeadline ? (
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              isOverdue && "text-rose-400 font-semibold"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {isOverdue ? `Quá hạn: ${formattedDeadline}` : `Hạn chót: ${formattedDeadline}`}
          </span>
        ) : (
          <span className="text-muted-foreground/60">Chưa đặt hạn chót</span>
        )}

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(project)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          {!isArchived && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onArchive(project)}
              className="h-7 w-7 text-muted-foreground hover:text-purple-400"
              title="Lưu trữ dự án"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(project)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Xóa dự án"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
