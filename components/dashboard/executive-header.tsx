"use client";

import * as React from "react";
import { Plus, Play, Sparkles, FileText, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutiveHeaderProps {
  greeting: string;
  userFullName: string;
  currentDateStr: string;
  focusCount: number;
  upcomingDeadlineCount: number;
  attentionProjectCount: number;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onOpenEventModal: () => void;
  onOpenTimerModal: () => void;
}

export function ExecutiveHeader({
  greeting,
  userFullName,
  currentDateStr,
  focusCount,
  upcomingDeadlineCount,
  attentionProjectCount,
  onOpenTaskModal,
  onOpenNoteModal,
  onOpenEventModal,
  onOpenTimerModal,
}: ExecutiveHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-5">
      {/* Left Greeting & Context */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          {greeting}, <span className="text-primary">{userFullName}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2 capitalize">
          <span>{currentDateStr}</span>
          <span>•</span>
          <span className="font-semibold text-foreground">Trung tâm điều hành cá nhân</span>
        </p>

        {/* Executive Metrics Summary Pill */}
        <div className="flex items-center space-x-2 pt-2 text-xs font-medium text-muted-foreground">
          <span className="px-2.5 py-1 rounded-full border bg-accent/30 text-foreground">
            <strong className="text-primary font-bold">{focusCount}</strong> việc cần làm
          </span>
          <span>·</span>
          <span className="px-2.5 py-1 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-300">
            <strong className="font-bold">{upcomingDeadlineCount}</strong> deadline sắp tới
          </span>
          <span>·</span>
          <span className="px-2.5 py-1 rounded-full border bg-rose-500/10 border-rose-500/30 text-rose-300">
            <strong className="font-bold">{attentionProjectCount}</strong> project cần chú ý
          </span>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          onClick={onOpenTaskModal}
          size="sm"
          className="gap-1.5 shadow-md text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Task
        </Button>
        <Button
          variant="outline"
          onClick={onOpenNoteModal}
          size="sm"
          className="gap-1.5 text-xs font-semibold"
        >
          <FileText className="h-3.5 w-3.5 text-sky-400" /> Note
        </Button>
        <Button
          variant="outline"
          onClick={onOpenEventModal}
          size="sm"
          className="gap-1.5 text-xs font-semibold"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-purple-400" /> Event
        </Button>
        <Button
          variant="outline"
          onClick={onOpenTimerModal}
          size="sm"
          className="gap-1.5 text-xs font-semibold border-primary/40 hover:bg-primary/10"
        >
          <Play className="h-3.5 w-3.5 text-emerald-400 fill-current" /> Start Timer
        </Button>
      </div>
    </div>
  );
}
