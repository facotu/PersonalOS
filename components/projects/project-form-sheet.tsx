"use client";

import * as React from "react";
import { Loader2, Plus, Edit3, FolderKanban } from "lucide-react";

import { ProjectItem, ProjectPriority, ProjectStatus } from "@/lib/projects/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createProjectAction, updateProjectAction } from "@/lib/projects/actions";
import { createProjectSchema } from "@/lib/projects/schemas";

interface ProjectFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: ProjectItem | null;
  onSuccess: () => void;
}

const colorPresets = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export function ProjectFormSheet({
  open,
  onOpenChange,
  projectToEdit,
  onSuccess,
}: ProjectFormSheetProps) {
  const isEditing = !!projectToEdit;

  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<ProjectPriority>("P2");
  const [status, setStatus] = React.useState<ProjectStatus>("Active");
  const [startDate, setStartDate] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [color, setColor] = React.useState("#3b82f6");

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (projectToEdit) {
        setName(projectToEdit.name);
        setGoal(projectToEdit.goal || "");
        setDescription(projectToEdit.description || "");
        setPriority(projectToEdit.priority);
        setStatus(projectToEdit.status);
        setStartDate(projectToEdit.start_date ? projectToEdit.start_date.substring(0, 10) : "");
        setDeadline(projectToEdit.deadline ? projectToEdit.deadline.substring(0, 10) : "");
        setColor(projectToEdit.color || "#3b82f6");
      } else {
        setName("");
        setGoal("");
        setDescription("");
        setPriority("P2");
        setStatus("Active");
        setStartDate("");
        setDeadline("");
        setColor("#3b82f6");
      }
    }
  }, [open, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      goal: goal || null,
      description: description || null,
      priority,
      status,
      start_date: startDate || null,
      deadline: deadline || null,
      color,
    };

    const validation = createProjectSchema.safeParse(payload);
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
      if (isEditing && projectToEdit) {
        await updateProjectAction(projectToEdit.id, payload);
        toast({
          title: "Cập nhật dự án thành công!",
          description: `Đã lưu thông tin cho "${name}".`,
        });
      } else {
        await createProjectAction(payload);
        toast({
          title: "Tạo dự án thành công!",
          description: `"${name}" đã được thêm vào danh sách mục tiêu.`,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Không thể cập nhật" : "Không thể tạo dự án",
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
            <FolderKanban className="h-5 w-5 text-primary" />
            {isEditing ? "Chỉnh Sửa Dự Án" : "Khởi Tạo Dự Án Mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật mục tiêu, thời hạn và trạng thái cho dự án"
              : "Tạo mục tiêu lớn để gom nhóm và theo dõi tiến độ các công việc"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Tên dự án <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên dự án..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mục tiêu dự án
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Hoàn thành triển khai App Cân Lúa trước quý 3..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Thêm mô tả phạm vi công việc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary resize-none"
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
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
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
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Planning">Chưa bắt đầu</option>
                <option value="Active">Đang thực hiện</option>
                <option value="Paused">Tạm dừng</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Archived">Đã lưu trữ</option>
              </select>
            </div>
          </div>

          {/* Start Date & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hạn chót (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Màu nhận diện dự án
            </label>
            <div className="flex items-center space-x-2 pt-1">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-primary ring-2 ring-primary/40" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              {isEditing ? "Lưu Thay Đổi" : "Tạo Dự Án"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
