"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Kanban, List, Plus, ArrowLeft } from "lucide-react";

import { TaskItem, TaskStatus } from "@/lib/tasks/types";
import { fetchTasks, updateTaskAction, deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function KanbanPage() {
  const queryClient = useQueryClient();

  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = React.useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<TaskItem | null>(null);

  // Fetch all active tasks for Kanban Board
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks", "kanban"],
    queryFn: () => fetchTasks({ view: "all" }),
  });

  // Realtime Supabase Subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-kanban-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Status Change Mutation via Drag & Drop
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      await updateTaskAction(taskId, { status });
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<TaskItem[]>(["tasks", "kanban"]);

      if (previousTasks) {
        queryClient.setQueryData<TaskItem[]>(
          ["tasks", "kanban"],
          previousTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
      }
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", "kanban"], context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Không thể di chuyển công việc",
        description: "Vui lòng thử lại sau.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Complete Mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      const nextStatus: TaskStatus =
        task.status === "HOAN_THANH" ? "CHUA_LAM" : "HOAN_THANH";
      await updateTaskAction(task.id, { status: nextStatus });
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
        description: "Công việc đã được gỡ khỏi bảng.",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/tasks"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Danh sách công việc
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 mt-1">
            <Kanban className="h-7 w-7 text-primary" /> Bảng Kanban Công Việc
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kéo thả công việc giữa các cột trạng thái để quản lý tiến độ trực quan
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/tasks">
              <List className="h-4 w-4" /> Dạng Danh Sách
            </Link>
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null);
              setCreateSheetOpen(true);
            }}
            size="sm"
            className="gap-1.5 shadow-md"
          >
            <Plus className="h-4 w-4" /> Tạo Công Việc
          </Button>
        </div>
      </div>

      {/* Main Kanban Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : (
        <TaskKanban
          tasks={tasks}
          onDropTask={(taskId, status) =>
            updateStatusMutation.mutate({ taskId, status })
          }
          onOpenDetail={setDetailTask}
          onToggleComplete={(t) => toggleCompleteMutation.mutate(t)}
        />
      )}

      {/* Form Sheet */}
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

      {/* Delete Dialog */}
      <TaskDeleteDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={(t) => deleteMutation.mutateAsync(t)}
      />
    </div>
  );
}
