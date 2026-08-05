"use client";

import * as React from "react";
import { Loader2, Plus, Edit3, Clock } from "lucide-react";

import { TimeEntryItem } from "@/lib/time/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createManualTimeEntryAction, updateTimeEntryAction } from "@/lib/time/actions";
import { manualTimeEntrySchema } from "@/lib/time/schemas";
import { fetchTasks, fetchProjectsOptions } from "@/lib/tasks/actions";
import { TaskItem } from "@/lib/tasks/types";

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryToEdit?: TimeEntryItem | null;
  onSuccess: () => void;
}

export function ManualEntryDialog({
  open,
  onOpenChange,
  entryToEdit,
  onSuccess,
}: ManualEntryDialogProps) {
  const isEditing = !!entryToEdit;

  const [taskId, setTaskId] = React.useState<string>("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [isBillable, setIsBillable] = React.useState(false);
  const [hourlyRate, setHourlyRate] = React.useState<number | "">("");

  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchTasks({ view: "all" }).then(setTasks);
      fetchProjectsOptions().then(setProjects);

      if (entryToEdit) {
        setTaskId(entryToEdit.task_id || "");
        setProjectId(entryToEdit.project_id || "");
        setDescription(entryToEdit.description || "");
        setStartTime(entryToEdit.started_at ? entryToEdit.started_at.substring(0, 16) : "");
        setEndTime(entryToEdit.ended_at ? entryToEdit.ended_at.substring(0, 16) : "");
        setIsBillable(entryToEdit.is_billable);
        setHourlyRate(entryToEdit.hourly_rate || "");
      } else {
        const now = new Date();
        const start = new Date(now.getTime() - 60 * 60 * 1000);
        setTaskId("");
        setProjectId("");
        setDescription("");
        setStartTime(start.toISOString().substring(0, 16));
        setEndTime(now.toISOString().substring(0, 16));
        setIsBillable(false);
        setHourlyRate("");
      }
    }
  }, [open, entryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      task_id: taskId || null,
      project_id: projectId || null,
      description: description || null,
      started_at: new Date(startTime).toISOString(),
      ended_at: new Date(endTime).toISOString(),
      is_billable: isBillable,
      hourly_rate: hourlyRate !== "" ? Number(hourlyRate) : null,
    };

    const validation = manualTimeEntrySchema.safeParse(payload);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Dữ liệu không hợp lệ",
        description: validation.error.errors[0]?.message || "Vui lòng kiểm tra lại.",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && entryToEdit) {
        await updateTimeEntryAction(entryToEdit.id, payload);
        toast({
          title: "Cập nhật thành công!",
          description: "Đã lưu bản ghi thời gian.",
        });
      } else {
        await createManualTimeEntryAction(payload);
        toast({
          title: "Đã thêm thời gian thủ công!",
          description: "Bản ghi thời gian đã được lưu vào Timesheet.",
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Không thể cập nhật" : "Không thể thêm thời gian",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            {isEditing ? "Chỉnh Sửa Bản Ghi Thời Gian" : "Thêm Thời Gian Thủ Công"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật mốc giờ bắt đầu, kết thúc và dự án tương ứng"
              : "Nhập thủ công thời gian làm việc để lưu vào Timesheet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Start & End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Giờ bắt đầu <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Giờ kết thúc <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          {/* Task Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Công việc (Task)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Không chọn công việc --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Project Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dự án (Project)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
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
              Mô tả chi tiết
            </label>
            <input
              type="text"
              placeholder="Ghi chú nội dung công việc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Billable & Hourly Rate */}
          <div className="grid grid-cols-2 gap-3 items-center pt-1">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Billable (Tính phí)</span>
            </label>

            {isBillable && (
              <div className="space-y-1">
                <input
                  type="number"
                  placeholder="Mức phí/giờ (VNĐ)"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : "")}
                  className="flex h-9 w-full rounded-lg border border-input bg-accent/30 px-3 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={loading}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 shadow-md">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <Edit3 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEditing ? "Lưu Thay Đổi" : "Thêm Thời Gian"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
