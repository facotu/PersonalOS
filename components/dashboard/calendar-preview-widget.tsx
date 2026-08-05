"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, ArrowUpRight, Clock } from "lucide-react";

import { CalendarPreviewItem } from "@/lib/dashboard/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface CalendarPreviewWidgetProps {
  items: CalendarPreviewItem[];
}

export function CalendarPreviewWidget({ items }: CalendarPreviewWidgetProps) {
  const getItemSymbol = (type: CalendarPreviewItem["type"]) => {
    switch (type) {
      case "EVENT":
        return <span className="text-sky-400 font-mono font-bold">●</span>;
      case "TASK":
        return <span className="text-emerald-400 font-mono font-bold">☐</span>;
      case "PROJECT":
        return <span className="text-purple-400 font-mono font-bold">◆</span>;
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-purple-400" /> Lịch Luyện Hôm Nay
          </CardTitle>
          <CardDescription className="text-xs">
            Xem nhanh các sự kiện & cuộc họp lên lịch trong ngày
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/calendar">
            Xem lịch <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {items.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-8 w-8 text-primary" />}
            title="Hôm nay không có sự kiện lên lịch"
            description="Bạn có thể tạo sự kiện hoặc cuộc họp mới trong Lịch."
          />
        ) : (
          items.map((item) => {
            const timeStr = new Date(item.start_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-accent/20 text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  {getItemSymbol(item.type)}
                  <span className="font-semibold text-foreground truncate">{item.title}</span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-sky-400" /> {timeStr}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
