"use client";

import { create } from "zustand";
import { TimeEntryItem } from "@/lib/time/types";
import {
  fetchActiveTimeEntry,
  startTimerAction,
  pauseTimerAction,
  resumeTimerAction,
  stopTimerAction,
} from "@/lib/time/actions";

interface TimerStoreState {
  activeEntry: TimeEntryItem | null;
  elapsedSeconds: number;
  isLoading: boolean;
  
  // Actions
  initTimer: () => Promise<void>;
  startTimer: (params: {
    task_id?: string | null;
    project_id?: string | null;
    description?: string | null;
    is_billable?: boolean;
  }) => Promise<TimeEntryItem>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<TimeEntryItem>;
  tick: () => void;
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  activeEntry: null,
  elapsedSeconds: 0,
  isLoading: true,

  initTimer: async () => {
    set({ isLoading: true });
    try {
      const active = await fetchActiveTimeEntry();
      if (active) {
        let elapsed = active.duration_seconds;
        if (active.status === "running") {
          const now = new Date();
          const runningElapsed = Math.max(0, Math.floor((now.getTime() - new Date(active.started_at).getTime()) / 1000));
          elapsed += runningElapsed;
        }
        set({ activeEntry: active, elapsedSeconds: elapsed });
      } else {
        set({ activeEntry: null, elapsedSeconds: 0 });
      }
    } catch (err) {
      console.error("Timer store init error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  startTimer: async (params) => {
    const entry = await startTimerAction(params);
    set({ activeEntry: entry, elapsedSeconds: 0 });
    return entry;
  },

  pauseTimer: async () => {
    const active = get().activeEntry;
    if (!active) return;

    const updated = await pauseTimerAction(active.id);
    set({ activeEntry: updated, elapsedSeconds: updated.duration_seconds });
  },

  resumeTimer: async () => {
    const active = get().activeEntry;
    if (!active) return;

    const updated = await resumeTimerAction(active.id);
    set({ activeEntry: updated, elapsedSeconds: updated.duration_seconds });
  },

  stopTimer: async () => {
    const active = get().activeEntry;
    if (!active) throw new Error("Không có đồng hồ nào đang chạy.");

    const stopped = await stopTimerAction(active.id);
    set({ activeEntry: null, elapsedSeconds: 0 });
    return stopped;
  },

  tick: () => {
    const active = get().activeEntry;
    if (!active || active.status !== "running") return;

    const now = new Date();
    const runningElapsed = Math.max(0, Math.floor((now.getTime() - new Date(active.started_at).getTime()) / 1000));
    set({ elapsedSeconds: active.duration_seconds + runningElapsed });
  },
}));
