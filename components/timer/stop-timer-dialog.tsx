"use client";

import * as React from "react";
import { Square, Star, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatHHMMSS } from "@/components/timer/global-timer";
import { cn } from "@/lib/utils";

interface StopTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elapsedSeconds: number;
  taskTitle: string;
  onConfirm: (focusScore: number | null) => Promise<void>;
}

const FOCUS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Cực kỳ phân tán", color: "text-red-400" },
  2: { label: "Rất phân tán", color: "text-red-400" },
  3: { label: "Phân tán nhiều", color: "text-orange-400" },
  4: { label: "Khá phân tán", color: "text-orange-400" },
  5: { label: "Bình thường", color: "text-yellow-400" },
  6: { label: "Khá tập trung", color: "text-yellow-400" },
  7: { label: "Tập trung tốt", color: "text-lime-400" },
  8: { label: "Tập trung rất tốt", color: "text-green-400" },
  9: { label: "Cực kỳ tập trung", color: "text-emerald-400" },
  10: { label: "Flow State! 🔥", color: "text-emerald-300" },
};

export function StopTimerDialog({
  open,
  onOpenChange,
  elapsedSeconds,
  taskTitle,
  onConfirm,
}: StopTimerDialogProps) {
  const [focusScore, setFocusScore] = React.useState<number | null>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset state khi dialog mở
  React.useEffect(() => {
    if (open) {
      setFocusScore(null);
      setHovered(null);
    }
  }, [open]);

  const handleConfirm = async (score: number | null) => {
    setLoading(true);
    try {
      await onConfirm(score);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const displayScore = hovered ?? focusScore;
  const scoreInfo = displayScore ? FOCUS_LABELS[displayScore] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Square className="h-5 w-5 text-destructive fill-current" />
            Dừng Đếm Giờ
          </DialogTitle>
          <DialogDescription>
            Đánh giá mức độ tập trung của phiên làm việc vừa xong
          </DialogDescription>
        </DialogHeader>

        {/* Session Summary */}
        <div className="rounded-xl border bg-card/60 p-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium truncate" title={taskTitle}>
            📋 {taskTitle}
          </p>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-mono font-bold text-lg text-foreground">
              {formatHHMMSS(elapsedSeconds)}
            </span>
            <span className="text-xs text-muted-foreground">thời gian làm việc</span>
          </div>
        </div>

        {/* Focus Score Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400" />
              Mức độ tập trung
            </label>
            {scoreInfo ? (
              <span className={cn("text-xs font-semibold", scoreInfo.color)}>
                {displayScore}/10 — {scoreInfo.label}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Bỏ qua (tùy chọn)</span>
            )}
          </div>

          {/* Star / Number Rating Grid */}
          <div className="flex items-center justify-between gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
              const isSelected = focusScore !== null && score <= focusScore;
              const isHovered = hovered !== null && score <= hovered;
              const active = isHovered || (!hovered && isSelected);

              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFocusScore(score === focusScore ? null : score)}
                  onMouseEnter={() => setHovered(score)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "flex-1 h-8 rounded-lg border text-xs font-bold transition-all duration-100",
                    active
                      ? "bg-primary border-primary text-primary-foreground scale-105 shadow-md"
                      : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                  title={FOCUS_LABELS[score].label}
                >
                  {score}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            1 = Rất phân tán · 5 = Bình thường · 10 = Flow State
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleConfirm(null)}
            disabled={loading}
            className="flex-1 text-muted-foreground"
          >
            Bỏ qua & Dừng
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleConfirm(focusScore)}
            disabled={loading}
            className="flex-1 gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            {focusScore ? `Lưu (Focus: ${focusScore}/10)` : "Dừng & Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
