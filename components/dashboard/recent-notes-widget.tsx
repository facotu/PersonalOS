"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Pin, FolderKanban } from "lucide-react";

import { NoteItem } from "@/lib/notes/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface RecentNotesWidgetProps {
  notes: NoteItem[];
  onOpenCreateNote: () => void;
}

export function RecentNotesWidget({ notes, onOpenCreateNote }: RecentNotesWidgetProps) {
  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" /> Ghi Chú Gần Đây
          </CardTitle>
          <CardDescription className="text-xs">
            Ý tưởng và tài liệu ghi chú vừa cập nhật
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
          <Link href="/notes">
            Tất cả ghi chú <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {notes.length === 0 ? (
          <EmptyState
            title="Chưa có ghi chú gần đây"
            description="Tạo ghi chú mới để ghi lại ý tưởng và công việc."
            actionLabel="+ Tạo ghi chú"
            onAction={onOpenCreateNote}
          />
        ) : (
          notes.map((note) => {
            const updatedDate = new Date(note.updated_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="flex items-center justify-between p-3 rounded-xl border bg-accent/20 hover:bg-accent/40 transition-all duration-200 text-xs group"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {note.is_pinned && <Pin className="h-3 w-3 text-amber-400 fill-current shrink-0" />}
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {note.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {note.project && (
                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[100px]">
                      {note.project.name}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-muted-foreground">{updatedDate}</span>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
