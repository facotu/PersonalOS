"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Clock, Calendar, ArrowUpRight } from "lucide-react";

import { DeadlineItem } from "@/lib/dashboard/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface DeadlineRadarProps {
  deadlines: DeadlineItem[];
}

export function DeadlineRadar({ deadlines }: DeadlineRadarProps) {
  const getCategoryBadge = (category: DeadlineItem["statusCategory"]) => {
    switch (category) {
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="h-3 w-3" /> QUÁ HẠN (Rủi ro cao)
          </span>
        );
      case "TODAY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> HÔM NAY (Cần xử lý)
          </span>
        );
      case "WITHIN_48H":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            TRONG 48 GIỜ
          </span>
        );
      case "WITHIN_7D":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent/40 text-muted-foreground border">
            TRONG 7 NGÀY
          </span>
        );
    }
  };

  const getItemSymbol = (type: DeadlineItem["type"]) => {
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
            <AlertCircle className="h-4 w-4 text-amber-400" /> Deadline Radar
          </CardTitle>
          <CardDescription className="text-xs">
            Theo dõi rủi ro các mốc thời gian quan trọng trong 7 ngày
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/calendar">
            Xem lịch <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {deadlines.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8 text-primary" />}
            title="Không có deadline sắp tới"
            description="Tất cả mốc thời gian và hạn chót đều an toàn."
          />
        ) : (
          deadlines.map((item) => {
            const timeStr = new Date(item.start_time).toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border text-xs transition-all",
                  item.statusCategory === "OVERDUE"
                    ? "bg-rose-500/10 border-rose-500/30"
                    : item.statusCategory === "TODAY"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-accent/20 border-border/60"
                )}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <span title={item.type}>{getItemSymbol(item.type)}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-foreground truncate block">
                      {item.title}
                    </span>
                    {item.project && (
                      <span className="text-[10px] text-muted-foreground font-medium truncate block">
                        Dự án: {item.project.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{timeStr}</span>
                  {getCategoryBadge(item.statusCategory)}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
