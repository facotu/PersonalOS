"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Archive, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/lib/projects/types";

interface ProjectDeleteDialogProps {
  project: ProjectItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmArchive: (project: ProjectItem) => Promise<void>;
  onConfirmDelete: (project: ProjectItem) => Promise<void>;
}

export function ProjectDeleteDialog({
  project,
  open,
  onOpenChange,
  onConfirmArchive,
  onConfirmDelete,
}: ProjectDeleteDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!project) return null;

  const totalTasks = project.total_tasks_count || 0;

  const handleArchive = async () => {
    setLoading(true);
    try {
      await onConfirmArchive(project);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(project);
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
            <AlertTriangle className="h-5 w-5" /> Quản Lý Xóa Dự Án
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground space-y-2">
            <div>
              Bạn đang yêu cầu thao tác với dự án <span className="font-semibold text-foreground">"{project.name}"</span>.
            </div>
            {totalTasks > 0 && (
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium">
                ⚠️ Dự án hiện đang chứa <strong>{totalTasks} công việc</strong> liên kết. Chúng tôi khuyến nghị <strong>Lưu trữ</strong> dự án thay vì xóa vĩnh viễn.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleArchive}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4 text-purple-400" />}
            Lưu Trữ Dự Án
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Xóa Vĩnh Viễn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
