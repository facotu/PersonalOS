"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Plus,
  Play,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react";

import { TimeEntryItem, TimeFilterOptions } from "@/lib/time/types";
import { fetchTimeEntries, deleteTimeEntryAction } from "@/lib/time/actions";
import { fetchProjectsOptions } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { TimeEntryRow, formatSummaryDuration } from "@/components/timer/time-entry-row";
import { TimeFilters } from "@/components/timer/time-filters";
import { ManualEntryDialog } from "@/components/timer/manual-entry-dialog";
import { StartTimerDialog } from "@/components/timer/start-timer-dialog";
import { TimeDeleteDialog } from "@/components/timer/time-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();

  const [currentWeekDate, setCurrentWeekDate] = React.useState<Date>(() => new Date());
  const [filters, setFilters] = React.useState<TimeFilterOptions>({});
  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);

  // Modals
  const [manualDialogOpen, setManualDialogOpen] = React.useState(false);
  const [startTimerOpen, setStartTimerOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<TimeEntryItem | null>(null);
  const [deletingEntry, setDeletingEntry] = React.useState<TimeEntryItem | null>(null);

  React.useEffect(() => {
    fetchProjectsOptions().then(setProjects);
  }, []);

  // Compute Week start & end (Monday -> Sunday)
  const { startOfWeek, endOfWeek, weekDays } = React.useMemo(() => {
    const start = new Date(currentWeekDate);
    let dayOfWeek = start.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;
    start.setDate(start.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return { startOfWeek: start, endOfWeek: end, weekDays: days };
  }, [currentWeekDate]);

  const activeFilters: TimeFilterOptions = {
    ...filters,
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  };

  // Query Timesheet Entries
  const { data: entries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["time-entries", activeFilters],
    queryFn: () => fetchTimeEntries(activeFilters),
  });

  // Realtime Supabase Subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-time-entries-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_entries" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["time-entries"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Navigate Week
  const handleNavigateWeek = (direction: "prev" | "next" | "current") => {
    if (direction === "current") {
      setCurrentWeekDate(new Date());
      return;
    }
    const next = new Date(currentWeekDate);
    next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekDate(next);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (entry: TimeEntryItem) => {
      await deleteTimeEntryAction(entry.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa bản ghi thời gian" });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
  });

  // Summary Metrics Calculation
  const todayIso = new Date().toISOString().substring(0, 10);

  const todayEntries = entries.filter(
    (e) => new Date(e.started_at).toISOString().substring(0, 10) === todayIso
  );

  const todayTotalSeconds = todayEntries.reduce((acc, e) => acc + e.duration_seconds, 0);
  const todayBillableSeconds = todayEntries
    .filter((e) => e.is_billable)
    .reduce((acc, e) => acc + e.duration_seconds, 0);

  const totalWeekSeconds = entries.reduce((acc, e) => acc + e.duration_seconds, 0);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Clock className="h-7 w-7 text-primary" /> Theo Dõi Thời Gian
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý Timesheet, tính thời gian làm việc và thống kê Billable hours
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingEntry(null);
              setManualDialogOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Thêm thời gian thủ công
          </Button>
          <Button
            onClick={() => setStartTimerOpen(true)}
            size="sm"
            className="gap-1.5 shadow-md"
          >
            <Play className="h-4 w-4 fill-current" /> Bắt đầu tính giờ
          </Button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border bg-card/60 space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-sky-400" /> Tổng thời gian hôm nay
          </span>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatSummaryDuration(todayTotalSeconds)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card/60 space-y-1">
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Billable hôm nay
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatSummaryDuration(todayBillableSeconds)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card/60 space-y-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-purple-400" /> Tổng trong tuần
          </span>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatSummaryDuration(totalWeekSeconds)}
          </div>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 border rounded-lg p-0.5 bg-accent/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigateWeek("prev")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateWeek("current")}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              Tuần hiện tại
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigateWeek("next")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm font-bold text-foreground pl-2">
            Tuần {startOfWeek.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} — {endOfWeek.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Daily Summary Tabs (T2 -> CN) */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {weekDays.map((d, idx) => {
          const dayIso = d.toISOString().substring(0, 10);
          const dayName = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][idx];
          const isToday = dayIso === todayIso;

          const dayTotalSecs = entries
            .filter((e) => new Date(e.started_at).toISOString().substring(0, 10) === dayIso)
            .reduce((acc, e) => acc + e.duration_seconds, 0);

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all ${
                isToday
                  ? "border-primary bg-primary/10 font-bold"
                  : "bg-card/40 border-border/60"
              }`}
            >
              <span className="text-muted-foreground text-[11px] font-semibold">{dayName}</span>
              <span className="text-foreground text-xs">{d.getDate()}</span>
              <span className="text-[10px] font-mono text-primary font-medium pt-1">
                {formatSummaryDuration(dayTotalSecs)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <TimeFilters filters={filters} onChange={setFilters} projects={projects} />

      {/* Timesheet List Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách thời gian"
          description="Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại đường truyền."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8 text-primary" />}
          title="Chưa có bản ghi thời gian nào trong tuần này"
          description="Bắt đầu đếm giờ hoặc thêm thời gian thủ công để ghi nhận thời gian làm việc."
          actionLabel="+ Thêm thời gian thủ công"
          onAction={() => {
            setEditingEntry(null);
            setManualDialogOpen(true);
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <TimeEntryRow
              key={entry.id}
              entry={entry}
              onEdit={(e) => {
                setEditingEntry(e);
                setManualDialogOpen(true);
              }}
              onDelete={setDeletingEntry}
            />
          ))}
        </div>
      ) : null}

      {/* Manual Entry Dialog */}
      <ManualEntryDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        entryToEdit={editingEntry}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["time-entries"] })}
      />

      {/* Quick Start Timer Dialog */}
      <StartTimerDialog open={startTimerOpen} onOpenChange={setStartTimerOpen} />

      {/* Delete Confirmation Dialog */}
      <TimeDeleteDialog
        entry={deletingEntry}
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        onConfirm={(e) => deleteMutation.mutateAsync(e)}
      />
    </div>
  );
}
