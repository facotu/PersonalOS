"use client";

import * as React from "react";
import Link from "next/link";
import { Pin, FolderKanban, CheckSquare, Trash2, Edit3 } from "lucide-react";

import { NoteItem } from "@/lib/notes/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: NoteItem;
  onTogglePin: (note: NoteItem) => void;
  onDelete: (note: NoteItem) => void;
}

export function NoteCard({ note, onTogglePin, onDelete }: NoteCardProps) {
  // Extract text snippet from JSONB content if possible
  let snippet = "";
  if (typeof note.content === "string") {
    snippet = note.content;
  } else if (note.content?.content) {
    // Basic Tiptap text extraction
    snippet = note.content.content
      .map((block: any) => (block.content ? block.content.map((c: any) => c.text).join(" ") : ""))
      .filter(Boolean)
      .join(" ");
  }

  const updatedDate = new Date(note.updated_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="group relative flex flex-col justify-between p-4 rounded-2xl border bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 space-y-3">
      {/* Header: Title & Pin Toggle */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/notes/${note.id}`}
            className="font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1 flex-1"
          >
            {note.title}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              onTogglePin(note);
            }}
            className={cn(
              "h-7 w-7 text-muted-foreground hover:text-foreground shrink-0",
              note.is_pinned && "text-amber-400 hover:text-amber-300"
            )}
            title={note.is_pinned ? "Gỡ ghim" : "Ghim lên đầu"}
          >
            <Pin className={cn("h-3.5 w-3.5", note.is_pinned && "fill-current")} />
          </Button>
        </div>

        {/* Snippet Preview */}
        {snippet && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {snippet}
          </p>
        )}
      </div>

      {/* Relations & Footer */}
      <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center space-x-2 truncate">
            {note.project && (
              <span className="flex items-center gap-1 font-medium text-foreground/80 truncate">
                <FolderKanban
                  className="h-3 w-3 shrink-0"
                  style={{ color: note.project.color || undefined }}
                />
                <span className="truncate">{note.project.name}</span>
              </span>
            )}

            {note.task && (
              <span className="flex items-center gap-1 truncate text-muted-foreground">
                <CheckSquare className="h-3 w-3 shrink-0" />
                <span className="truncate">{note.task.title}</span>
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono shrink-0 ml-auto">{updatedDate}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Link href={`/notes/${note.id}`}>
              <Edit3 className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Xóa ghi chú"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
