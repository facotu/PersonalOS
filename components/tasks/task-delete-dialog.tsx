"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/lib/tasks/types";

interface TaskDeleteDialogProps {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (task: TaskItem) => Promise<void>;
}

export function TaskDeleteDialog({
  task,
  open,
  onOpenChange,
  onConfirm,
}: TaskDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!task) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(task);
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
            <AlertTriangle className="h-5 w-5" /> Xóa Công Việc Này?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa công việc <span className="font-semibold text-foreground">"{task.title}"</span> không? Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
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
            Xóa Công Việc
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
