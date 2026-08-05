"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pin,
  Sparkles,
  Trash2,
} from "lucide-react";

import { fetchNoteById, updateNoteAction, togglePinNoteAction, deleteNoteAction } from "@/lib/notes/actions";
import { fetchProjectsOptions } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import { TiptapEditor } from "@/components/notes/tiptap-editor";
import { AICopilotDrawer } from "@/components/notes/ai-copilot-drawer";
import { NoteDeleteDialog } from "@/components/notes/note-delete-dialog";
import { createClient } from "@/lib/supabase/client";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const noteId = params?.id as string;

  const [title, setTitle] = React.useState("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [noteContentText, setNoteContentText] = React.useState("");

  const [aiDrawerOpen, setAiDrawerOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projects, setProjects] = React.useState<Array<{ id: string; name: string }>>([]);

  // Fetch Note Detail
  const { data: note, isLoading, isError } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
    enabled: !!noteId,
  });

  React.useEffect(() => {
    fetchProjectsOptions().then(setProjects);
  }, []);

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setProjectId(note.project_id || "");
    }
  }, [note]);

  // Realtime Supabase Subscription
  React.useEffect(() => {
    if (!noteId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-note-detail-${noteId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `id=eq.${noteId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["note", noteId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId, queryClient]);

  // Debounced Autosave Handler
  const autosaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = React.useCallback(
    (newTitle: string, newProjectId: string, newContentJson: any) => {
      setSaveStatus("saving");

      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await updateNoteAction(noteId, {
            title: newTitle,
            project_id: newProjectId || null,
            content: newContentJson,
          });
          setSaveStatus("saved");
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        } catch (err) {
          console.error("Autosave error:", err);
          setSaveStatus("error");
        }
      }, 500);
    },
    [noteId, queryClient]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (note) {
      triggerAutosave(val, projectId, note.content);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProjectId(val);
    if (note) {
      triggerAutosave(title, val, note.content);
    }
  };

  const handleContentChange = (contentJson: any, textContent: string) => {
    setNoteContentText(textContent);
    if (note) {
      triggerAutosave(title, projectId, contentJson);
    }
  };

  // Toggle Pin Mutation
  const togglePinMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      await togglePinNoteAction(note.id, !note.is_pinned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
  });

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      await deleteNoteAction(note.id);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa ghi chú thành công" });
      router.push("/notes");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <EmptyState
        title="Không tìm thấy ghi chú"
        description="Ghi chú này không tồn tại hoặc đã bị xóa."
        actionLabel="Quay lại danh sách ghi chú"
        onAction={() => router.push("/notes")}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Link
            href="/notes"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 shrink-0 font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Danh sách ghi chú
          </Link>

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Nhập tiêu đề ghi chú..."
            className="w-full bg-transparent text-xl sm:text-2xl font-bold text-foreground outline-none border-b border-transparent focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Project Link Selector */}
          <select
            value={projectId}
            onChange={handleProjectChange}
            className="h-9 rounded-lg border bg-accent/30 text-xs px-2.5 text-foreground outline-none max-w-[150px] truncate"
          >
            <option value="">-- Không chọn dự án --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Pin Button */}
          <Button
            variant={note.is_pinned ? "secondary" : "outline"}
            size="sm"
            onClick={() => togglePinMutation.mutate()}
            className="gap-1.5 text-xs"
            title={note.is_pinned ? "Gỡ ghim" : "Ghim ghi chú"}
          >
            <Pin className={`h-3.5 w-3.5 ${note.is_pinned ? "text-amber-400 fill-current" : ""}`} />
            {note.is_pinned ? "Đã ghim" : "Ghim"}
          </Button>

          {/* AI Copilot Drawer Trigger */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setAiDrawerOpen(true)}
            className="gap-1.5 text-xs shadow-md bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Copilot
          </Button>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Tiptap Rich Text Editor */}
      <TiptapEditor
        initialContent={note.content}
        onChangeContent={handleContentChange}
        saveStatus={saveStatus}
      />

      {/* AI Copilot Drawer Panel */}
      <AICopilotDrawer
        open={aiDrawerOpen}
        onOpenChange={setAiDrawerOpen}
        noteTitle={title}
        noteContentText={noteContentText}
        projectName={note.project?.name}
        onTaskCreatedSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <NoteDeleteDialog
        note={note}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteNoteMutation.mutateAsync()}
      />
    </div>
  );
}
