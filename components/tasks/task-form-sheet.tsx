"use client";

import * as React from "react";
import { Loader2, Plus, Edit3, Tag, X, Trash2 } from "lucide-react";

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
  const [tags, setTags] = React.useState<Array<{ id: string; name: string; color: string | null }>>([]);
  const [loading, setLoading] = React.useState(false);

  // New Tag Form States
  const [showNewTagForm, setShowNewTagForm] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState("");
  const [newTagColor, setNewTagColor] = React.useState("#3b82f6");
  const [tagCreating, setTagCreating] = React.useState(false);

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
        setShowNewTagForm(false);
        setNewTagName("");
      }
    }
  }, [open, taskToEdit]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setTagCreating(true);
    try {
      const newTag = await createTagAction(newTagName, newTagColor);
      setTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName("");
      setShowNewTagForm(false);
      toast({ title: "Đã tạo nhãn dán mới!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể tạo nhãn dán",
        description: err.message || "Tên nhãn đã tồn tại hoặc không hợp lệ.",
      });
    } finally {
      setTagCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Bạn có chắc chắn muốn xóa nhãn dán này vĩnh viễn?")) return;
    try {
      await deleteTagAction(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
      toast({ title: "Đã xóa nhãn dán." });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Không thể xóa nhãn dán.",
      });
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

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

          {/* Tags Section */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" /> Nhãn dán công việc (Tags)
              </label>
              <button
                type="button"
                onClick={() => setShowNewTagForm(!showNewTagForm)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                {showNewTagForm ? "Hủy" : "+ Thêm nhãn mới"}
              </button>
            </div>

            {/* Create Tag Form */}
            {showNewTagForm && (
              <div className="p-3 rounded-lg border bg-accent/20 space-y-3 animate-in slide-in-from-top-2 duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tên nhãn..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 h-8 rounded border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={tagCreating}
                    className="h-8 text-xs px-3"
                  >
                    {tagCreating ? "Đang tạo..." : "Tạo"}
                  </Button>
                </div>
                {/* Color Selector */}
                <div className="flex flex-wrap gap-1.5">
                  {["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`h-5 w-5 rounded-full border transition-all ${
                        newTagColor === c ? "ring-2 ring-primary scale-110" : "opacity-80"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tags Grid Select */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTag(t.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold cursor-pointer select-none transition-all ${
                      isSelected
                        ? "shadow-sm border-primary/50 text-white"
                        : "border-border/60 text-muted-foreground bg-accent/10 hover:bg-accent/30"
                    }`}
                    style={{ backgroundColor: isSelected ? `${t.color || "#64748b"}25` : undefined }}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.color || "#64748b" }}
                    />
                    <span style={{ color: isSelected ? t.color || "#ffffff" : undefined }}>{t.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTag(t.id, e)}
                      className="text-muted-foreground hover:text-destructive shrink-0 ml-0.5 rounded-full p-0.5 hover:bg-accent/50"
                      title="Xóa nhãn"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })}
              {tags.length === 0 && (
                <p className="text-[11px] text-muted-foreground italic">Chưa có nhãn dán nào. Hãy tạo nhãn mới!</p>
              )}
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
