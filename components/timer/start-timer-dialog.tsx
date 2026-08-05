"use client";

import * as React from "react";
import { Play, Loader2, Clock } from "lucide-react";

import { useTimerStore } from "@/lib/time/timer-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchTasks, fetchProjectsOptions } from "@/lib/tasks/actions";
import { TaskItem } from "@/lib/tasks/types";

interface StartTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartTimerDialog({ open, onOpenChange }: StartTimerDialogProps) {
  const { startTimer, activeEntry } = useTimerStore();

  const [taskId, setTaskId] = React.useState<string>("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [description, setDescription] = React.useState("");
  const [isBillable, setIsBillable] = React.useState(false);

  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchTasks({ view: "all" }).then(setTasks);
      fetchProjectsOptions().then(setProjects);

      setTaskId("");
      setProjectId("");
      setDescription("");
      setIsBillable(false);
    }
  }, [open]);

  // Handle Task selection auto-infer Project
  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setTaskId(selectedId);

    if (selectedId) {
      const taskObj = tasks.find((t) => t.id === selectedId);
      if (taskObj?.project_id) {
        setProjectId(taskObj.project_id);
      }
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await startTimer({
        task_id: taskId || null,
        project_id: projectId || null,
        description: description || null,
        is_billable: isBillable,
      });

      toast({
        title: "Đã bắt đầu đếm giờ!",
        description: "Đồng hồ đang chạy ngầm trong ứng dụng.",
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể bắt đầu đếm giờ",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" /> Bắt Đầu Đếm Giờ Làm Việc
          </DialogTitle>
          <DialogDescription>
            Chọn công việc hoặc dự án để theo dõi thời gian thực hiện
          </DialogDescription>
        </DialogHeader>

        {activeEntry && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium space-y-1">
            ⚠️ Bạn đang có một đồng hồ đếm giờ đang chạy ("{activeEntry.task?.title || "Công việc"}") . Vui lòng dừng đồng hồ hiện tại trước khi khởi tạo đồng hồ mới.
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-4 pt-2">
          {/* Task Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chọn công việc (Task)
            </label>
            <select
              value={taskId}
              onChange={handleTaskChange}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Không chọn công việc --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.project ? `(${t.project.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Project Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chọn dự án (Project)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={!!taskId && !!tasks.find((t) => t.id === taskId)?.project_id}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              <option value="">-- Không chọn dự án --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mô tả hoạt động
            </label>
            <input
              type="text"
              placeholder="Ghi chú ngắn về nội dung đang làm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Billable Checkbox */}
          <label className="flex items-center space-x-2 text-sm cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="font-medium text-foreground">Đánh dấu thời gian có tính phí (Billable)</span>
          </label>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !!activeEntry}
              className="gap-1.5 shadow-md"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              Bắt Đầu Đếm Giờ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
