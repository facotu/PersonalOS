"use client";

import * as React from "react";
import { UnifiedCalendarItem } from "@/lib/calendar/types";
import { CalendarItemChip } from "@/components/calendar/calendar-item-chip";
import { cn } from "@/lib/utils";

interface CalendarWeekViewProps {
  currentDate: Date;
  items: UnifiedCalendarItem[];
  onClickSlot: (date: Date) => void;
  onClickItem: (item: UnifiedCalendarItem) => void;
}

export function CalendarWeekView({
  currentDate,
  items,
  onClickSlot,
  onClickItem,
}: CalendarWeekViewProps) {
  // Compute start of week (Monday)
  const startOfWeek = new Date(currentDate);
  let dayOfWeek = startOfWeek.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Generate 7 days of the week
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const todayIso = new Date().toISOString().substring(0, 10);
  const now = new Date();

  // Current time position indicator (%)
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const topTimePct = ((currentHour * 60 + currentMin) / (24 * 60)) * 100;

  return (
    <div className="rounded-2xl border bg-card/60 backdrop-blur-md overflow-x-auto shadow-sm min-w-[700px]">
      {/* Week Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-accent/30 text-center text-xs font-semibold py-2.5">
        <div className="text-muted-foreground">Giờ</div>
        {weekDays.map((date, idx) => {
          const cellIso = date.toISOString().substring(0, 10);
          const isToday = cellIso === todayIso;
          const dayName = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][idx];

          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <span className="text-muted-foreground font-medium">{dayName}</span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time Grid with Current Time Line */}
      <div className="relative grid grid-cols-[60px_repeat(7,1fr)] divide-x divide-y border-t border-border/40 text-xs max-h-[600px] overflow-y-auto">
        {/* Red Current Time Line Indicator */}
        <div
          className="absolute left-[60px] right-0 border-t-2 border-red-500 z-10 pointer-events-none flex items-center"
          style={{ top: `${topTimePct}%` }}
        >
          <div className="h-2 w-2 rounded-full bg-red-500 -ml-1" />
        </div>

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time Label */}
            <div className="p-2 text-center text-[11px] font-mono text-muted-foreground/80 bg-accent/10 select-none">
              {String(hour).padStart(2, "0")}:00
            </div>

            {/* 7 Day Slot Cells for this hour */}
            {weekDays.map((date, dayIdx) => {
              const slotDate = new Date(date);
              slotDate.setHours(hour, 0, 0, 0);

              const cellIso = date.toISOString().substring(0, 10);
              const slotItems = items.filter((item) => {
                const itemDate = new Date(item.start_time);
                return (
                  itemDate.toISOString().substring(0, 10) === cellIso &&
                  itemDate.getHours() === hour
                );
              });

              return (
                <div
                  key={dayIdx}
                  onClick={() => onClickSlot(slotDate)}
                  className="min-h-[50px] p-1 hover:bg-accent/30 transition-colors cursor-pointer space-y-1"
                >
                  {slotItems.map((item) => (
                    <CalendarItemChip
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      onClickItem={onClickItem}
                    />
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
