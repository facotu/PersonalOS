"use client";

import * as React from "react";
import { UnifiedCalendarItem } from "@/lib/calendar/types";
import { CalendarItemChip } from "@/components/calendar/calendar-item-chip";
import { cn } from "@/lib/utils";

interface CalendarMonthViewProps {
  currentDate: Date;
  items: UnifiedCalendarItem[];
  onClickSlot: (date: Date) => void;
  onClickItem: (item: UnifiedCalendarItem) => void;
}

export function CalendarMonthView({
  currentDate,
  items,
  onClickSlot,
  onClickItem,
}: CalendarMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & Days count
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Day of week offset (Monday = 0 ... Sunday = 6)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday fix

  const todayIso = new Date().toISOString().substring(0, 10);

  // Generate 35 or 42 grid cells
  const daysGrid: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    daysGrid.push({ date: prevDate, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Next month padding to fill grid
  const remaining = 35 - daysGrid.length;
  if (remaining > 0) {
    for (let j = 1; j <= remaining; j++) {
      daysGrid.push({ date: new Date(year, month + 1, j), isCurrentMonth: false });
    }
  }

  const weekHeaders = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="rounded-2xl border bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
      {/* Month Headers */}
      <div className="grid grid-cols-7 border-b bg-accent/30 text-center text-xs font-semibold text-muted-foreground py-2.5">
        {weekHeaders.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 divide-x divide-y border-t border-border/40 text-xs">
        {daysGrid.map(({ date, isCurrentMonth }, idx) => {
          const cellIso = date.toISOString().substring(0, 10);
          const isToday = cellIso === todayIso;

          // Filter items falling on this date
          const cellItems = items.filter((item) => {
            const itemDateIso = new Date(item.start_time).toISOString().substring(0, 10);
            return itemDateIso === cellIso;
          });

          const visibleItems = cellItems.slice(0, 3);
          const overflowCount = cellItems.length - 3;

          return (
            <div
              key={idx}
              onClick={() => onClickSlot(date)}
              className={cn(
                "min-h-[110px] sm:min-h-[130px] p-1.5 transition-colors cursor-pointer hover:bg-accent/30 flex flex-col justify-between",
                !isCurrentMonth && "bg-accent/10 opacity-40"
              )}
            >
              {/* Date Number Header */}
              <div className="flex items-center justify-between pb-1">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground"
                  )}
                >
                  {date.getDate()}
                </span>

                {cellItems.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono font-medium">
                    {cellItems.length} mục
                  </span>
                )}
              </div>

              {/* Items Stack */}
              <div className="flex-1 space-y-1 overflow-hidden pt-0.5">
                {visibleItems.map((item) => (
                  <CalendarItemChip
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onClickItem={onClickItem}
                    compact
                  />
                ))}

                {overflowCount > 0 && (
                  <div className="text-[10px] font-semibold text-primary pl-1 pt-0.5">
                    +{overflowCount} mục khác
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
