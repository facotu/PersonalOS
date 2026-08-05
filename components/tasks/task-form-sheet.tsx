"use client";

import * as React from "react";
import { Loader2, Plus, Edit3 } from "lucide-react";

import { TaskItem, TaskPriority, TaskStatus, EnergyLevel } from "@/lib/tasks/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createTaskAction, updateTaskAction, fetchProjectsOptions, fetchTagsOptions } from "@/lib/tasks/actions";
import { createTaskSchema } from "@/lib/tasks/schemas";

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: TaskItem | null;
  onSuccess: () => void;
}

export function TaskFormSheet({
  open,
  onOpenChange,
  taskToEdit,
  onSuccess,
}: TaskFormSheetProps) {
  const isEditing = !!taskToEdit;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [priority, setPriority] = React.useState<TaskPriority>("P2");
  const [status, setStatus] = React.useState<TaskStatus>("CHUA_LAM");
  const [dueDate, setDueDate] = React.useState("");
  const [estimatedHours, setEstimatedHours] = React.useState<number>(0);
  const [energyLevel, setEnergyLevel] = React.useState<EnergyLevel>("MEDIUM");
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);

  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Load dropdown options
      fetchProjectsOptions().then(setProjects);
      fetchTagsOptions().then(setTags);

      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setProjectId(taskToEdit.project_id || "");
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 16) : "");
        setEstimatedHours(taskToEdit.estimated_hours || 0);
        setEnergyLevel(taskToEdit.energy_level || "MEDIUM");
        setSelectedTagIds(taskToEdit.tags ? taskToEdit.tags.map((t) => t.id) : []);
      } else {
        // Reset form for Create mode
        setTitle("");
        setDescription("");
        setProjectId("");
        setPriority("P2");
        setStatus("CHUA_LAM");
        setDueDate("");
        setEstimatedHours(0);
        setEnergyLevel("MEDIUM");
        setSelectedTagIds([]);
      }
    }
  }, [open, taskToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description: description || null,
      project_id: projectId || null,
      priority,
      status,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      estimated_hours: Number(estimatedHours) || 0,
      energy_level: energyLevel,
      tag_ids: selectedTagIds,
    };

    const validation = createTaskSchema.safeParse(payload);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Dữ liệu không hợp lệ",
        description: validation.error.errors[0]?.message || "Vui lòng kiểm tra lại thông tin.",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && taskToEdit) {
        await updateTaskAction(taskToEdit.id, payload);
        toast({
          title: "Cập nhật thành công!",
          description: `Đã lưu thay đổi cho "${title}".`,
        });
      } else {
        await createTaskAction(payload);
        toast({
          title: "Tạo công việc thành công!",
          description: `"${title}" đã được thêm vào danh sách.`,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Không thể cập nhật" : "Không thể tạo công việc",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            {isEditing ? <Edit3 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
            {isEditing ? "Chỉnh Sửa Công Việc" : "Tạo Công Việc Mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật các thuộc tính và hạn chót cho công việc"
              : "Điền đầy đủ thông tin để khởi tạo công việc mới"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Tên công việc <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên công việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Thêm mô tả hoặc ghi chú quan trọng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mức ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="P0">P0 — Khẩn cấp</option>
                <option value="P1">P1 — Cao</option>
                <option value="P2">P2 — Bình thường</option>
                <option value="P3">P3 — Thấp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="CHUA_LAM">Chưa làm</option>
                <option value="DANG_LAM">Đang làm</option>
                <option value="CHO">Chờ</option>
                <option value="HOAN_THANH">Hoàn thành</option>
                <option value="HUY">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Project Assignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dự án liên kết
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Không thuộc dự án nào --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hạn chót (Due Date)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Estimated Hours & Energy Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Giờ dự kiến (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Năng lượng
              </label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="HIGH">High (Năng lượng cao)</option>
                <option value="MEDIUM">Medium (Vừa phải)</option>
                <option value="LOW">Low (Thấp)</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <Edit3 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEditing ? "Lưu Thay Đổi" : "Tạo Công Việc"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
