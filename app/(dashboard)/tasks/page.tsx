"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { TaskItem, TaskFilterOptions, TaskViewMode, TaskStatus } from "@/lib/tasks/types";
import { fetchTasks, updateTaskAction, deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function TasksPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = React.useState<TaskViewMode>("all");
  const [filters, setFilters] = React.useState<TaskFilterOptions>({
    view: "all",
    sortBy: "priority",
    sortOrder: "asc",
  });

  // Modal States
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = React.useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<TaskItem | null>(null);

  // Sync viewMode into filters
  const activeFilters: TaskFilterOptions = { ...filters, view: viewMode };

  // Fetch Tasks with TanStack Query
  const { data: tasks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", activeFilters],
    queryFn: () => fetchTasks(activeFilters),
  });

  // Realtime Supabase Subscription Setup
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_tags" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Optimistic Toggle Complete Mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      const nextStatus: TaskStatus =
        task.status === "HOAN_THANH" ? "CHUA_LAM" : "HOAN_THANH";
      await updateTaskAction(task.id, { status: nextStatus });
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<TaskItem[]>(["tasks", activeFilters]);

      if (previousTasks) {
        queryClient.setQueryData<TaskItem[]>(
          ["tasks", activeFilters],
          previousTasks.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: t.status === "HOAN_THANH" ? "CHUA_LAM" : "HOAN_THANH",
                }
              : t
          )
        );
      }

      return { previousTasks };
    },
    onError: (err, task, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", activeFilters], context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Không thể cập nhật công việc",
        description: "Vui lòng thử lại sau.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      await deleteTaskAction(task.id);
    },
    onSuccess: () => {
      toast({
        title: "Đã xóa công việc",
        description: "Công việc đã được gỡ khỏi hệ thống.",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Vui lòng thử lại sau.";
      toast({
        variant: "destructive",
        title: "Không thể xóa công việc",
        description: message,
      });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" /> Quản Lý Công Việc
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và tập trung vào những việc quan trọng nhất
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/tasks/kanban">
              <Kanban className="h-4 w-4" /> Kanban Board
            </Link>
          </Button>
          <Button onClick={() => { setEditingTask(null); setCreateSheetOpen(true); }} size="sm" className="gap-1.5 shadow-md">
            <Plus className="h-4 w-4" /> Tạo Công Việc
          </Button>
        </div>
      </div>

      {/* Quick Add Bar (<10s task creation) */}
      <QuickAddTask onTaskCreated={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />

      {/* View Mode Navigation Tabs & Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "Tất cả", icon: List },
              { id: "today", label: "Hôm nay", icon: Clock },
              { id: "week", label: "Tuần này", icon: Calendar },
              { id: "overdue", label: "Quá hạn", icon: AlertCircle },
              { id: "completed", label: "Hoàn thành", icon: CheckCircle2 },
            ].map((tab) => {
              const isActive = viewMode === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(tab.id as TaskViewMode)}
                  className="gap-1.5 text-xs sm:text-sm font-medium"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <div className="flex space-x-1 border rounded-lg p-0.5 bg-accent/40">
            <Button variant="secondary" size="icon" className="h-7 w-7">
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Link href="/tasks/kanban">
                <Kanban className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Main Task List Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách công việc"
          description="Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8 text-primary" />}
          title={
            viewMode === "today"
              ? "Hôm nay chưa có công việc cần xử lý"
              : viewMode === "overdue"
              ? "Không có công việc nào bị quá hạn"
              : "Bạn chưa có công việc nào"
          }
          description="Tạo công việc mới để bắt đầu theo dõi và quản lý hiệu suất làm việc."
          actionLabel="+ Tạo công việc mới"
          onAction={() => {
            setEditingTask(null);
            setCreateSheetOpen(true);
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleComplete={(t) => toggleCompleteMutation.mutate(t)}
              onOpenDetail={setDetailTask}
              onEdit={(t) => {
                setEditingTask(t);
                setCreateSheetOpen(true);
              }}
              onDelete={setDeletingTask}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Form Sheet */}
      <TaskFormSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        taskToEdit={editingTask}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
      />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(open) => !open && setDetailTask(null)}
        onToggleComplete={(t) => toggleCompleteMutation.mutate(t)}
        onEdit={(t) => {
          setDetailTask(null);
          setEditingTask(t);
          setCreateSheetOpen(true);
        }}
        onDelete={(t) => {
          setDetailTask(null);
          setDeletingTask(t);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <TaskDeleteDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={(t) => deleteMutation.mutateAsync(t)}
      />
    </div>
  );
}
