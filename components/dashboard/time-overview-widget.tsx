"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, DollarSign, Calendar, ArrowUpRight, Play } from "lucide-react";

import { DashboardTimeSummary } from "@/lib/dashboard/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSummaryDuration } from "@/components/timer/time-entry-row";

interface TimeOverviewWidgetProps {
  summary: DashboardTimeSummary;
  onOpenTimerModal: () => void;
}

export function TimeOverviewWidget({ summary, onOpenTimerModal }: TimeOverviewWidgetProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" /> Tổng Quan Thời Gian
          </CardTitle>
          <CardDescription className="text-xs">
            Thời gian làm việc đã ghi nhận trong ngày & tuần
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/time">
            Timesheet <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl border bg-accent/30 space-y-0.5">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
              Hôm nay
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatSummaryDuration(summary.todayTotalSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-0.5">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1">
              Billable
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {formatSummaryDuration(summary.todayBillableSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-accent/30 space-y-0.5">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
              Tuần này
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatSummaryDuration(summary.weekTotalSeconds)}
            </div>
          </div>
        </div>

        {/* Start Timer Quick Trigger */}
        <Button
          onClick={onOpenTimerModal}
          size="sm"
          className="w-full gap-1.5 shadow-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Play className="h-3.5 w-3.5 fill-white" /> Bắt Đầu Tính Giờ Ngay
        </Button>
      </CardContent>
    </Card>
  );
}
