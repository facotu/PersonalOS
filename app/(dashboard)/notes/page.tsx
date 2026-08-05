"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";

import { NoteItem, NoteFilterOptions } from "@/lib/notes/types";
import { fetchNotes, createNoteAction, togglePinNoteAction, deleteNoteAction } from "@/lib/notes/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { NoteCard } from "@/components/notes/note-card";
import { NoteFilters } from "@/components/notes/note-filters";
import { NoteDeleteDialog } from "@/components/notes/note-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function NotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState<NoteFilterOptions>({});
  const [deletingNote, setDeletingNote] = React.useState<NoteItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  // Query Notes
  const { data: notes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["notes", filters],
    queryFn: () => fetchNotes(filters),
  });

  // Realtime Supabase Subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create Quick Note & Redirect
  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const newNote = await createNoteAction({
        title: "Ghi chú chưa đặt tên",
        content: {},
        is_pinned: false,
      });

      toast({
        title: "Đã tạo ghi chú mới!",
        description: "Đang mở trình soạn thảo...",
      });
      router.push(`/notes/${newNote.id}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể tạo ghi chú",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setCreating(false);
    }
  };

  // Toggle Pin Mutation
  const togglePinMutation = useMutation({
    mutationFn: async (note: NoteItem) => {
      await togglePinNoteAction(note.id, !note.is_pinned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (note: NoteItem) => {
      await deleteNoteAction(note.id);
    },
    onSuccess: () => {
      toast({
        title: "Đã xóa ghi chú",
        description: "Ghi chú đã được gỡ khỏi hệ thống.",
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" /> Smart Notes & AI Copilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ghi chú thông minh tích hợp AI hỗ trợ tóm tắt và tự động hóa công việc
          </p>
        </div>

        <Button
          onClick={handleCreateNote}
          disabled={creating}
          size="sm"
          className="gap-1.5 shadow-md"
        >
          <Plus className="h-4 w-4" /> Tạo Ghi Chú Mới
        </Button>
      </div>

      {/* Filter Bar */}
      <NoteFilters filters={filters} onChange={setFilters} />

      {/* Main Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách ghi chú"
          description="Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại đường truyền."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-primary" />}
          title="Chưa có ghi chú nào"
          description="Tạo ghi chú mới để bắt đầu lưu trữ ý tưởng và phân tích cùng AI Copilot."
          actionLabel="+ Tạo ghi chú mới"
          onAction={handleCreateNote}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePin={(n) => togglePinMutation.mutate(n)}
              onDelete={setDeletingNote}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <NoteDeleteDialog
        note={deletingNote}
        open={!!deletingNote}
        onOpenChange={(open) => !open && setDeletingNote(null)}
        onConfirm={(n) => deleteMutation.mutateAsync(n)}
      />
    </div>
  );
}
