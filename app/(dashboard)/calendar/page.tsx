"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Grid,
  Columns,
  CalendarDays,
} from "lucide-react";

import {
  CalendarEventItem,
  CalendarViewMode,
  CalendarFilterOptions,
  UnifiedCalendarItem,
} from "@/lib/calendar/types";
import { TaskItem, TaskStatus } from "@/lib/tasks/types";
import {
  fetchUnifiedCalendarItems,
  deleteEventAction,
} from "@/lib/calendar/actions";
import { updateTaskAction, deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { CalendarDayView } from "@/components/calendar/calendar-day-view";
import { CalendarEventFormSheet } from "@/components/calendar/calendar-event-form-sheet";
import { CalendarEventDetailSheet } from "@/components/calendar/calendar-event-detail-sheet";
import { CalendarEventDeleteDialog } from "@/components/calendar/calendar-event-delete-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function CalendarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("month");
  const [filters, setFilters] = React.useState<CalendarFilterOptions>({
    showEvents: true,
    showTasks: true,
    showProjects: true,
  });

  // Modal States for Event
  const [createEventOpen, setCreateEventOpen] = React.useState(false);
  const [prefillSlotDate, setPrefillSlotDate] = React.useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEventItem | null>(null);
  const [detailEvent, setDetailEvent] = React.useState<CalendarEventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = React.useState<CalendarEventItem | null>(null);

  // Modal States for Task Integration
  const [detailTask, setDetailTask] = React.useState<TaskItem | null>(null);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [editTaskFormOpen, setEditTaskFormOpen] = React.useState(false);
  const [deletingTask, setDeletingTask] = React.useState<TaskItem | null>(null);

  // Compute Query Range ISO strings
  const { startIso, endIso } = React.useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === "week") {
      let day = start.getDay() - 1;
      if (day === -1) day = 6;
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    };
  }, [currentDate, viewMode]);

  // Unified Query
  const { data: calendarItems = [], isLoading } = useQuery({
    queryKey: ["calendar-items", viewMode, startIso, endIso, filters],
    queryFn: () => fetchUnifiedCalendarItems(startIso, endIso, filters),
  });

  // Realtime Supabase Subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-calendar-unified")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_events" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Date Navigation Handlers
  const handleNavigate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }

    const next = new Date(currentDate);
    const amount = direction === "next" ? 1 : -1;

    if (viewMode === "month") {
      next.setMonth(next.getMonth() + amount);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + amount * 7);
    } else {
      next.setDate(next.getDate() + amount);
    }

    setCurrentDate(next);
  };

  // Slot Click -> Prefill Date & Open Create Event Form
  const handleClickSlot = (date: Date) => {
    setPrefillSlotDate(date);
    setEditingEvent(null);
    setCreateEventOpen(true);
  };

  // Unified Item Click Handler
  const handleClickItem = (item: UnifiedCalendarItem) => {
    if (item.kind === "event" && item.rawEvent) {
      setDetailEvent(item.rawEvent);
    } else if (item.kind === "task" && item.rawTask) {
      setDetailTask(item.rawTask);
    } else if (item.kind === "project_deadline" && item.rawProject) {
      router.push(`/projects/${item.rawProject.id}`);
    }
  };

  // Delete Event Mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (event: CalendarEventItem) => {
      await deleteEventAction(event.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa sự kiện lịch" });
      queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
    },
  });

  // Toggle Task Complete Mutation (Phase 4 Reuse)
  const toggleTaskCompleteMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      const nextStatus: TaskStatus =
        task.status === "HOAN_THANH" ? "CHUA_LAM" : "HOAN_THANH";
      await updateTaskAction(task.id, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (task: TaskItem) => {
      await deleteTaskAction(task.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa công việc" });
      queryClient.invalidateQueries({ queryKey: ["calendar-items"] });
    },
  });

  // Header Title Formatting (Vietnamese)
  const formattedHeaderTitle = React.useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "day") {
      return currentDate.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      return `Tuần ${currentDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })}`;
    }
  }, [currentDate, viewMode]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-primary" /> Lịch Cá Nhân
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trung tâm quản lý thời gian, lịch họp, công việc và mốc deadline
          </p>
        </div>

        <Button
          onClick={() => {
            setPrefillSlotDate(null);
            setEditingEvent(null);
            setCreateEventOpen(true);
          }}
          size="sm"
          className="gap-1.5 shadow-md"
        >
          <Plus className="h-4 w-4" /> Tạo Sự Kiện
        </Button>
      </div>

      {/* Date Navigation & View Mode Switcher Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation Buttons & Title */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 border rounded-lg p-0.5 bg-accent/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate("prev")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("today")}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              Hôm nay
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate("next")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-foreground capitalize pl-2">
            {formattedHeaderTitle}
          </h2>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-1 border rounded-lg p-1 bg-accent/30">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="gap-1.5 text-xs font-medium h-7 px-3"
          >
            <Grid className="h-3.5 w-3.5" /> Tháng
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="gap-1.5 text-xs font-medium h-7 px-3"
          >
            <Columns className="h-3.5 w-3.5" /> Tuần
          </Button>
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("day")}
            className="gap-1.5 text-xs font-medium h-7 px-3"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Ngày
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <CalendarFilters filters={filters} onChange={setFilters} />

      {/* Main Calendar View Render */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      ) : viewMode === "month" ? (
        <CalendarMonthView
          currentDate={currentDate}
          items={calendarItems}
          onClickSlot={handleClickSlot}
          onClickItem={handleClickItem}
        />
      ) : viewMode === "week" ? (
        <CalendarWeekView
          currentDate={currentDate}
          items={calendarItems}
          onClickSlot={handleClickSlot}
          onClickItem={handleClickItem}
        />
      ) : (
        <CalendarDayView
          currentDate={currentDate}
          items={calendarItems}
          onClickSlot={handleClickSlot}
          onClickItem={handleClickItem}
        />
      )}

      {/* Event Create / Edit Form Sheet */}
      <CalendarEventFormSheet
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        eventToEdit={editingEvent}
        prefillSlotDate={prefillSlotDate}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["calendar-items"] })}
      />

      {/* Event Detail Sheet */}
      <CalendarEventDetailSheet
        event={detailEvent}
        open={!!detailEvent}
        onOpenChange={(open) => !open && setDetailEvent(null)}
        onEdit={(evt) => {
          setDetailEvent(null);
          setEditingEvent(evt);
          setCreateEventOpen(true);
        }}
        onDelete={(evt) => {
          setDetailEvent(null);
          setDeletingEvent(evt);
        }}
      />

      {/* Event Delete Dialog */}
      <CalendarEventDeleteDialog
        event={deletingEvent}
        open={!!deletingEvent}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
        onConfirm={(evt) => deleteEventMutation.mutateAsync(evt)}
      />

      {/* Task Integration Sheets (Reused from Phase 4) */}
      <TaskDetailSheet
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(open) => !open && setDetailTask(null)}
        onToggleComplete={(t) => toggleTaskCompleteMutation.mutate(t)}
        onEdit={(t) => {
          setDetailTask(null);
          setEditingTask(t);
          setEditTaskFormOpen(true);
        }}
        onDelete={(t) => {
          setDetailTask(null);
          setDeletingTask(t);
        }}
      />

      <TaskFormSheet
        open={editTaskFormOpen}
        onOpenChange={setEditTaskFormOpen}
        taskToEdit={editingTask}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["calendar-items"] })}
      />

      <TaskDeleteDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={(t) => deleteTaskMutation.mutateAsync(t)}
      />
    </div>
  );
}
