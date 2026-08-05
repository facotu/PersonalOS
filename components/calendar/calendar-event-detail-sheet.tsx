"use client";

import * as React from "react";
import { Calendar, Clock, MapPin, Edit3, Trash2 } from "lucide-react";
import { CalendarEventItem } from "@/lib/calendar/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CalendarEventTypeBadge } from "@/components/calendar/calendar-event-type-badge";
import { Button } from "@/components/ui/button";

interface CalendarEventDetailSheetProps {
  event: CalendarEventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEventItem) => void;
  onDelete: (event: CalendarEventItem) => void;
}

export function CalendarEventDetailSheet({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CalendarEventDetailSheetProps) {
  if (!event) return null;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const formattedDate = startDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = event.is_all_day
    ? "Cả ngày"
    : `${startDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${endDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
        <SheetHeader className="pb-4 border-b space-y-2">
          <div className="flex items-center gap-2">
            <CalendarEventTypeBadge type={event.event_type} />
          </div>
          <SheetTitle className="text-xl font-bold leading-snug">{event.title}</SheetTitle>
          <SheetDescription className="text-xs">
            Khởi tạo ngày {new Date(event.created_at).toLocaleDateString("vi-VN")}
          </SheetDescription>
        </SheetHeader>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(event)}
            className="flex-1 gap-1.5"
          >
            <Edit3 className="h-4 w-4" /> Chỉnh sửa sự kiện
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(event)}
            className="text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Xóa sự kiện
          </Button>
        </div>

        {/* Date & Time Info */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-card">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div>
              <div className="font-semibold text-foreground capitalize">{formattedDate}</div>
              <div className="text-xs text-muted-foreground">{formattedTime}</div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-card">
              <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Địa điểm / Link họp</div>
                <div className="font-medium text-foreground truncate">{event.location}</div>
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        {event.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nội dung mô tả
            </h4>
            <div className="p-3 rounded-xl border bg-accent/30 text-sm whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
