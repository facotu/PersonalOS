"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getDashboardData } from "@/lib/dashboard/actions";
import { createNoteAction } from "@/lib/notes/actions";
import { TaskItem } from "@/lib/tasks/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { ExecutiveHeader } from "@/components/dashboard/executive-header";
import { TodaysFocus } from "@/components/dashboard/todays-focus";
import { DeadlineRadar } from "@/components/dashboard/deadline-radar";
import { ProjectHealthWidget } from "@/components/dashboard/project-health-widget";
import { CalendarPreviewWidget } from "@/components/dashboard/calendar-preview-widget";
import { TimeOverviewWidget } from "@/components/dashboard/time-overview-widget";
import { RecentNotesWidget } from "@/components/dashboard/recent-notes-widget";

// Existing Modals Reused from Phases 4, 6, 8
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { CalendarEventFormSheet } from "@/components/calendar/calendar-event-form-sheet";
import { StartTimerDialog } from "@/components/timer/start-timer-dialog";
import { createClient } from "@/lib/supabase/client";

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modals state
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = React.useState<TaskItem | null>(null);
  const [eventFormOpen, setEventFormOpen] = React.useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = React.useState(false);

  // Fetch Dashboard Data Layer
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getDashboardData(),
    refetchInterval: 30000, // Refresh dashboard metrics every 30 seconds
  });

  // Realtime Subscriptions across all business tables
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-dashboard-hub")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_events" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "time_entries" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Quick Create Note Handler
  const handleQuickCreateNote = async () => {
    try {
      const newNote = await createNoteAction({
        title: "Ghi chú chưa đặt tên",
        content: {},
        is_pinned: false,
      });
      toast({ title: "Đã tạo ghi chú mới!" });
      router.push(`/notes/${newNote.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không rõ lỗi.";
      toast({
        variant: "destructive",
        title: "Không thể tạo ghi chú",
        description: message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in-50">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center space-y-4 border rounded-2xl bg-card/60">
        <h2 className="text-xl font-bold text-destructive">Không thể tải dữ liệu Dashboard</h2>
        <p className="text-sm text-muted-foreground">Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* 1. Executive Header */}
      <ExecutiveHeader
        greeting={data.greeting}
        userFullName={data.userFullName}
        currentDateStr={data.currentDateStr}
        focusCount={data.focusCount}
        upcomingDeadlineCount={data.upcomingDeadlineCount}
        attentionProjectCount={data.attentionProjectCount}
        onOpenTaskModal={() => setTaskFormOpen(true)}
        onOpenNoteModal={handleQuickCreateNote}
        onOpenEventModal={() => setEventFormOpen(true)}
        onOpenTimerModal={() => setTimerDialogOpen(true)}
      />

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Focus, Health, Time Overview */}
        <div className="space-y-6">
          {/* 2. Today's Focus */}
          <TodaysFocus
            tasks={data.focusTasks}
            onSelectTask={setSelectedTaskDetail}
            onOpenCreateTask={() => setTaskFormOpen(true)}
          />

          {/* 4. Project Health */}
          <ProjectHealthWidget projects={data.projectHealth} />

          {/* 6. Time Overview */}
          <TimeOverviewWidget
            summary={data.timeSummary}
            onOpenTimerModal={() => setTimerDialogOpen(true)}
          />
        </div>

        {/* Right Column: Radar, Calendar Preview, Recent Notes */}
        <div className="space-y-6">
          {/* 3. Deadline Radar */}
          <DeadlineRadar deadlines={data.deadlines} />

          {/* 5. Calendar Preview */}
          <CalendarPreviewWidget items={data.calendarPreview} />

          {/* 7. Recent Notes */}
          <RecentNotesWidget
            notes={data.recentNotes}
            onOpenCreateNote={handleQuickCreateNote}
          />
        </div>
      </div>

      {/* Modals Reused from Business Modules */}
      <TaskFormSheet open={taskFormOpen} onOpenChange={setTaskFormOpen} />
      
      <TaskDetailSheet
        task={selectedTaskDetail}
        open={!!selectedTaskDetail}
        onOpenChange={(open) => !open && setSelectedTaskDetail(null)}
      />

      <CalendarEventFormSheet open={eventFormOpen} onOpenChange={setEventFormOpen} />

      <StartTimerDialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen} />
    </div>
  );
}
