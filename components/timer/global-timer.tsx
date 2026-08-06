"use client";

import * as React from "react";
import { Play, Pause, Square, Clock, Loader2, Star } from "lucide-react";

import { useTimerStore } from "@/lib/time/timer-store";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { StartTimerDialog } from "@/components/timer/start-timer-dialog";
import { StopTimerDialog } from "@/components/timer/stop-timer-dialog";
import { cn } from "@/lib/utils";

/**
 * Format helper for HH:MM:SS format
 */
export function formatHHMMSS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

export function GlobalTimer() {
  const {
    activeEntry,
    elapsedSeconds,
    isLoading,
    initTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  const [startDialogOpen, setStartDialogOpen] = React.useState(false);
  const [stopDialogOpen, setStopDialogOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Initialize timer on mount & restore state
  React.useEffect(() => {
    initTimer();
  }, [initTimer]);

  // Tick interval for UI display updates
  React.useEffect(() => {
    if (!activeEntry || activeEntry.status !== "running") return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry, tick]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await pauseTimer();
      toast({ title: "Đã tạm dừng đếm giờ" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tạm dừng.";
      toast({ variant: "destructive", title: "Lỗi", description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await resumeTimer();
      toast({ title: "Đã tiếp tục đếm giờ" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tiếp tục.";
      toast({ variant: "destructive", title: "Lỗi", description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopWithScore = async (focusScore: number | null) => {
    setActionLoading(true);
    try {
      const stopped = await stopTimer(focusScore);
      toast({
        title: "Đã dừng và lưu thời gian!",
        description: `Thời gian ghi nhận: ${formatHHMMSS(stopped.duration_seconds)}${focusScore ? ` · Focus: ${focusScore}/10` : ""}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể dừng đồng hồ.";
      toast({ variant: "destructive", title: "Lỗi", description: message });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-card/40 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Đang kiểm tra đồng hồ...</span>
      </div>
    );
  }

  // Active Timer Display
  if (activeEntry) {
    const isRunning = activeEntry.status === "running";

    return (
      <>
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-1 rounded-xl border text-xs shadow-sm transition-all duration-200",
            isRunning
              ? "bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/20"
              : "bg-amber-500/10 border-amber-500/40"
          )}
        >
          {/* Task / Project Context */}
          <div className="flex items-center space-x-1.5 max-w-[200px] sm:max-w-[280px] truncate">
            <div
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                isRunning ? "bg-sky-400 animate-pulse" : "bg-amber-400"
              )}
            />
            <span className="font-semibold text-foreground truncate">
              {activeEntry.task?.title || activeEntry.description || "Công việc không tên"}
            </span>
            {activeEntry.project && (
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                ({activeEntry.project.name})
              </span>
            )}
          </div>

          {/* Ticker HH:MM:SS */}
          <span className="font-mono font-bold text-sm tracking-wider text-primary px-1.5">
            {formatHHMMSS(elapsedSeconds)}
          </span>

          {/* Action Controls */}
          <div className="flex items-center space-x-1">
            {isRunning ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePause}
                disabled={actionLoading}
                className="h-7 w-7 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                title="Tạm dừng"
              >
                <Pause className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleResume}
                disabled={actionLoading}
                className="h-7 w-7 text-sky-400 border-sky-500/30 hover:bg-sky-500/20"
                title="Tiếp tục"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </Button>
            )}

            {/* Stop Button — mở StopTimerDialog để chấm điểm focus */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => setStopDialogOpen(true)}
              disabled={actionLoading}
              className="h-7 w-7"
              title="Dừng và đánh giá tập trung"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Square className="h-3.5 w-3.5 fill-current" />
              )}
            </Button>
          </div>
        </div>

        {/* Stop Timer + Focus Score Dialog */}
        <StopTimerDialog
          open={stopDialogOpen}
          elapsedSeconds={elapsedSeconds}
          taskTitle={activeEntry.task?.title || activeEntry.description || "Công việc không tên"}
          onOpenChange={setStopDialogOpen}
          onConfirm={handleStopWithScore}
        />
      </>
    );
  }

  // IDLE State Button
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setStartDialogOpen(true)}
        className="gap-1.5 text-xs font-semibold shadow-sm border-primary/40 hover:bg-primary/10"
      >
        <Play className="h-3.5 w-3.5 text-primary fill-current" /> Bắt đầu tính giờ
      </Button>

      <StartTimerDialog open={startDialogOpen} onOpenChange={setStartDialogOpen} />
    </>
  );
}
