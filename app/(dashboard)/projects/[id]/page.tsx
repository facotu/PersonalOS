"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  Edit3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { ProjectItem } from "@/lib/projects/types";
import { TaskItem, TaskStatus } from "@/lib/tasks/types";
import { fetchProjectById, updateProjectAction, deleteProjectAction } from "@/lib/projects/actions";
import { fetchTasks, updateTaskAction, deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectHealthBadge } from "@/components/projects/project-health-badge";
import { ProjectFormSheet } from "@/components/projects/project-form-sheet";
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog";
import { ProjectTimeline } from "@/components/projects/project-timeline";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params?.id as string;

  const [activeTab, setActiveTab] = React.useState<"overview" | "tasks" | "timeline">("overview");

  // Modal States
  const [editProjectOpen, setEditProjectOpen] = React.useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = React.useState(false);

  // Task Modals
  const [createTaskOpen, setCreateTaskOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = React.useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<TaskItem | null>(null);

  // Query Project Detail
  const { data: project, isLoading: isProjectLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectById(projectId),
    enabled: !!projectId,
  });

  // Query Project Tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => fetchTasks({ project_id: projectId }),
    enabled: !!projectId,
  });

  // Realtime Supabase Subscription
  React.useEffect(() => {
    if (!projectId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-project-detail-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
          queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  // Task Complete Mutation
  const toggleTaskCompleteMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      const nextStatus: TaskStatus =
        task.status === "HOAN_THANH" ? "CHUA_LAM" : "HOAN_THANH";
      await updateTaskAction(task.id, { status: nextStatus });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      await deleteTaskAction(task.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa công việc" });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
  });

  // Delete Project Mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (proj: ProjectItem) => {
      await deleteProjectAction(proj.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa dự án thành công" });
      router.push("/projects");
    },
  });

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <EmptyState
        title="Không tìm thấy dự án"
        description="Dự án này không tồn tại hoặc đã bị xóa."
        actionLabel="Quay lại danh sách dự án"
        onAction={() => router.push("/projects")}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Back Button & Top Header */}
      <div className="space-y-3 border-b pb-5">
        <Link
          href="/projects"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Danh sách dự án
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <ProjectPriorityBadge priority={project.priority} />
              <ProjectStatusBadge status={project.status} />
              <ProjectHealthBadge health={project.health} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 mt-1">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project.color || "#3b82f6" }}
              />
              {project.name}
            </h1>
            {project.goal && (
              <p className="text-sm text-muted-foreground">{project.goal}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditProjectOpen(true)}
              className="gap-1.5"
            >
              <Edit3 className="h-4 w-4" /> Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteProjectOpen(true)}
              className="text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex space-x-2 border-b pb-2">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
          className="gap-1.5"
        >
          <LayoutDashboard className="h-4 w-4" /> Tổng quan
        </Button>
        <Button
          variant={activeTab === "tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("tasks")}
          className="gap-1.5"
        >
          <ListTodo className="h-4 w-4" /> Danh sách công việc ({tasks.length})
        </Button>
        <Button
          variant={activeTab === "timeline" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("timeline")}
          className="gap-1.5"
        >
          <Calendar className="h-4 w-4" /> Timeline & Tiến độ
        </Button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Progress Bar Header */}
          <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckSquare className="h-4 w-4 text-primary" /> Tiến độ hoàn thành dự án
              </span>
              <span className="text-xl font-bold text-primary">{project.progress_pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${project.progress_pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Công thức: {project.completed_tasks_count} task hoàn thành / {project.active_tasks_count} task đang hoạt động = {project.progress_pct}%
            </p>
          </div>

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border bg-card/60 space-y-1">
              <span className="text-xs text-muted-foreground">Tổng số Task</span>
              <div className="text-2xl font-bold text-foreground">{project.total_tasks_count}</div>
            </div>
            <div className="p-4 rounded-xl border bg-card/60 space-y-1">
              <span className="text-xs text-emerald-400">Đã hoàn thành</span>
              <div className="text-2xl font-bold text-emerald-400">{project.completed_tasks_count}</div>
            </div>
            <div className="p-4 rounded-xl border bg-card/60 space-y-1">
              <span className="text-xs text-sky-400">Đang hoạt động</span>
              <div className="text-2xl font-bold text-sky-400">{project.active_tasks_count}</div>
            </div>
            <div className="p-4 rounded-xl border bg-card/60 space-y-1">
              <span className="text-xs text-rose-400">Task quá hạn</span>
              <div className="text-2xl font-bold text-rose-400">{project.overdue_tasks_count}</div>
            </div>
          </div>

          {/* Description & Goal Details */}
          {project.description && (
            <div className="p-5 rounded-2xl border bg-card/60 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mô tả phạm vi dự án
              </h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-foreground">
              Công việc thuộc dự án ({tasks.length})
            </h3>
            <Button
              onClick={() => {
                setEditingTask(null);
                setCreateTaskOpen(true);
              }}
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm công việc vào dự án
            </Button>
          </div>

          {/* Quick Add Bar */}
          <QuickAddTask
            onTaskCreated={() => {
              queryClient.invalidateQueries({ queryKey: ["project", projectId] });
              queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
            }}
          />

          {/* Tasks List */}
          {isTasksLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="Dự án chưa có công việc nào"
              description="Thêm công việc đầu tiên để bắt đầu theo dõi tiến độ thực hiện."
              actionLabel="+ Thêm công việc mới"
              onAction={() => setCreateTaskOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggleComplete={(t) => toggleTaskCompleteMutation.mutate(t)}
                  onOpenDetail={setDetailTask}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setCreateTaskOpen(true);
                  }}
                  onDelete={setDeletingTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === "timeline" && (
        <ProjectTimeline project={project} tasks={tasks} />
      )}

      {/* Project Edit Form Sheet */}
      <ProjectFormSheet
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        projectToEdit={project}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["project", projectId] })}
      />

      {/* Project Delete Dialog */}
      <ProjectDeleteDialog
        project={project}
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        onConfirmArchive={async (p) => {
          await updateProjectAction(p.id, { status: "Archived" });
          toast({ title: "Đã lưu trữ dự án" });
          router.push("/projects");
        }}
        onConfirmDelete={(p) => deleteProjectMutation.mutateAsync(p)}
      />

      {/* Task Creation & Detail Sheets */}
      <TaskFormSheet
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        taskToEdit={editingTask}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
          queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
        }}
      />

      <TaskDetailSheet
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(open) => !open && setDetailTask(null)}
        onToggleComplete={(t) => toggleTaskCompleteMutation.mutate(t)}
        onEdit={(t) => {
          setDetailTask(null);
          setEditingTask(t);
          setCreateTaskOpen(true);
        }}
        onDelete={(t) => {
          setDetailTask(null);
          setDeletingTask(t);
        }}
      />

      <TaskDeleteDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={(t) => deleteTaskMutation.mutateAsync(t)}
      />
    </div>
  );
}
