"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarEventItem } from "@/lib/calendar/types";

interface CalendarEventDeleteDialogProps {
  event: CalendarEventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (event: CalendarEventItem) => Promise<void>;
}

export function CalendarEventDeleteDialog({
  event,
  open,
  onOpenChange,
  onConfirm,
}: CalendarEventDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(event);
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
            <AlertTriangle className="h-5 w-5" /> Xóa Sự Kiện Lịch?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa sự kiện <span className="font-semibold text-foreground">"{event.title}"</span> không? Thao tác này không thể hoàn tác.
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
            Xóa Sự Kiện
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
