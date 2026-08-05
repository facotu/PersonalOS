"use client";

import * as React from "react";
import { Loader2, Plus, Edit3, Calendar as CalendarIcon } from "lucide-react";

import { CalendarEventItem, CalendarEventType } from "@/lib/calendar/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createEventAction, updateEventAction } from "@/lib/calendar/actions";
import { createEventSchema } from "@/lib/calendar/schemas";
import { fetchProjectsOptions } from "@/lib/tasks/actions";

interface CalendarEventFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: CalendarEventItem | null;
  prefillSlotDate?: Date | null;
  onSuccess: () => void;
}

export function CalendarEventFormSheet({
  open,
  onOpenChange,
  eventToEdit,
  prefillSlotDate,
  onSuccess,
}: CalendarEventFormSheetProps) {
  const isEditing = !!eventToEdit;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [isAllDay, setIsAllDay] = React.useState(false);
  const [location, setLocation] = React.useState("");
  const [eventType, setEventType] = React.useState<CalendarEventType>("Meeting");
  const [projectId, setProjectId] = React.useState<string>("");

  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchProjectsOptions().then(setProjects);

      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || "");
        setStartTime(eventToEdit.start_time ? eventToEdit.start_time.substring(0, 16) : "");
        setEndTime(eventToEdit.end_time ? eventToEdit.end_time.substring(0, 16) : "");
        setIsAllDay(eventToEdit.is_all_day);
        setLocation(eventToEdit.location || "");
        setEventType(eventToEdit.event_type || "Meeting");
        setProjectId(eventToEdit.project_id || "");
      } else if (prefillSlotDate) {
        setTitle("");
        setDescription("");
        const start = new Date(prefillSlotDate);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
        setStartTime(start.toISOString().substring(0, 16));
        setEndTime(end.toISOString().substring(0, 16));
        setIsAllDay(false);
        setLocation("");
        setEventType("Meeting");
        setProjectId("");
      } else {
        setTitle("");
        setDescription("");
        const now = new Date();
        const end = new Date(now.getTime() + 60 * 60 * 1000);
        setStartTime(now.toISOString().substring(0, 16));
        setEndTime(end.toISOString().substring(0, 16));
        setIsAllDay(false);
        setLocation("");
        setEventType("Meeting");
        setProjectId("");
      }
    }
  }, [open, eventToEdit, prefillSlotDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description: description || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      is_all_day: isAllDay,
      location: location || null,
      event_type: eventType,
      project_id: projectId || null,
    };

    const validation = createEventSchema.safeParse(payload);
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
      if (isEditing && eventToEdit) {
        await updateEventAction(eventToEdit.id, payload);
        toast({
          title: "Cập nhật sự kiện thành công!",
          description: `Đã lưu thay đổi cho "${title}".`,
        });
      } else {
        await createEventAction(payload);
        toast({
          title: "Tạo sự kiện thành công!",
          description: `"${title}" đã được thêm vào lịch.`,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Không thể cập nhật" : "Không thể tạo sự kiện",
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
            <CalendarIcon className="h-5 w-5 text-primary" />
            {isEditing ? "Chỉnh Sửa Sự Kiện Lịch" : "Tạo Sự Kiện Lịch Mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin thời gian, địa điểm cho sự kiện"
              : "Thêm lịch hẹn, cuộc họp hoặc ghi chú thời gian vào lịch làm việc"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Tên sự kiện <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên sự kiện hoặc cuộc họp..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Event Type & Project */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Loại sự kiện
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Meeting">Cuộc họp</option>
                <option value="Task">Công việc</option>
                <option value="Personal">Cá nhân</option>
                <option value="Reminder">Nhắc nhở</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dự án liên kết
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">-- Không chọn --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          {/* All Day Checkbox & Location */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Sự kiện diễn ra cả ngày</span>
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Địa điểm / Link họp
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phòng họp A1 / Google Meet..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ghi chú mô tả
            </label>
            <textarea
              rows={3}
              placeholder="Thêm chi tiết nội dung cuộc họp hoặc ghi chú..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
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
              {isEditing ? "Lưu Thay Đổi" : "Tạo Sự Kiện"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
