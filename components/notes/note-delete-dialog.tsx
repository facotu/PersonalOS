"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NoteItem } from "@/lib/notes/types";

interface NoteDeleteDialogProps {
  note: NoteItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: NoteItem) => Promise<void>;
}

export function NoteDeleteDialog({
  note,
  open,
  onOpenChange,
  onConfirm,
}: NoteDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!note) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(note);
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
            <AlertTriangle className="h-5 w-5" /> Xóa Ghi Chú?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa ghi chú <span className="font-semibold text-foreground">"{note.title}"</span> không? Thao tác này không thể hoàn tác.
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
            Xóa Ghi Chú
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
