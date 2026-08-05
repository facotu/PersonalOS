"use client";

import * as React from "react";
import { UnifiedCalendarItem } from "@/lib/calendar/types";
import { CalendarItemChip } from "@/components/calendar/calendar-item-chip";

interface CalendarDayViewProps {
  currentDate: Date;
  items: UnifiedCalendarItem[];
  onClickSlot: (date: Date) => void;
  onClickItem: (item: UnifiedCalendarItem) => void;
}

export function CalendarDayView({
  currentDate,
  items,
  onClickSlot,
  onClickItem,
}: CalendarDayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayIso = currentDate.toISOString().substring(0, 10);
  const now = new Date();
  const isToday = dayIso === now.toISOString().substring(0, 10);

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const topTimePct = ((currentHour * 60 + currentMin) / (24 * 60)) * 100;

  const dayItems = items.filter(
    (item) => new Date(item.start_time).toISOString().substring(0, 10) === dayIso
  );

  return (
    <div className="rounded-2xl border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
      {/* Day Header */}
      <div className="p-4 border-b bg-accent/30 flex items-center justify-between">
        <h3 className="font-bold text-base text-foreground">
          {currentDate.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h3>
        <span className="text-xs font-semibold text-muted-foreground font-mono">
          {dayItems.length} mục trong ngày
        </span>
      </div>

      {/* Hourly Timeline with Current Time Line */}
      <div className="relative divide-y text-xs max-h-[600px] overflow-y-auto">
        {/* Red Current Time Line Indicator */}
        {isToday && (
          <div
            className="absolute left-[70px] right-0 border-t-2 border-red-500 z-10 pointer-events-none flex items-center"
            style={{ top: `${topTimePct}%` }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5" />
          </div>
        )}

        {hours.map((hour) => {
          const slotDate = new Date(currentDate);
          slotDate.setHours(hour, 0, 0, 0);

          const slotItems = dayItems.filter((item) => {
            const itemDate = new Date(item.start_time);
            return itemDate.getHours() === hour;
          });

          return (
            <div
              key={hour}
              onClick={() => onClickSlot(slotDate)}
              className="flex min-h-[55px] hover:bg-accent/30 transition-colors cursor-pointer"
            >
              {/* Hour Label */}
              <div className="w-[70px] p-2 text-center text-xs font-mono text-muted-foreground/80 bg-accent/10 border-r shrink-0 select-none">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Slot Items */}
              <div className="flex-1 p-1.5 space-y-1">
                {slotItems.map((item) => (
                  <CalendarItemChip
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onClickItem={onClickItem}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
