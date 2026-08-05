"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeEntryItem } from "@/lib/time/types";
import { formatVietnameseDuration } from "@/components/timer/time-entry-row";

interface TimeDeleteDialogProps {
  entry: TimeEntryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (entry: TimeEntryItem) => Promise<void>;
}

export function TimeDeleteDialog({
  entry,
  open,
  onOpenChange,
  onConfirm,
}: TimeDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!entry) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(entry);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Xóa Bản Ghi Thời Gian?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Bạn có chắc muốn xóa bản ghi thời gian <span className="font-semibold text-foreground">"{entry.task?.title || entry.description || "Bản ghi"}"</span> ({formatVietnameseDuration(entry.duration_seconds)}) này không? Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Xóa Bản Ghi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
