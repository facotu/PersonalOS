"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  ListCheck,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  initialContent?: any;
  onChangeContent: (contentJson: any, textContent: string) => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  readOnly?: boolean;
}

export function TiptapEditor({
  initialContent,
  onChangeContent,
  saveStatus = "idle",
  readOnly = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu gõ nội dung ghi chú thông minh tại đây...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent || "",
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      onChangeContent(json, text);
    },
  });

  if (!editor) {
    return <div className="h-48 rounded-xl border bg-accent/10 animate-pulse" />;
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-card/60 backdrop-blur-md shadow-sm overflow-hidden min-h-[400px]">
      {/* Editor Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b bg-accent/30 text-xs">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Text Styling */}
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-8 w-8"
            title="Tiêu đề H1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 w-8"
            title="Tiêu đề H2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-8 w-8"
            title="Tiêu đề H3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Lists & Task Checklist */}
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8"
            title="Danh sách dấu chấm"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8"
            title="Danh sách số"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("taskList") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className="h-8 w-8"
            title="Checklist công việc"
          >
            <ListCheck className="h-3.5 w-3.5 text-emerald-400" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Blockquote & Code */}
          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8"
            title="Trích dẫn (Quote)"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className="h-8 w-8"
            title="Khối mã nguồn (Code Block)"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Undo / Redo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Autosave Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2 text-[11px] font-medium shrink-0">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-sky-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Đang lưu...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Đã lưu
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertCircle className="h-3 w-3" /> Lỗi khi lưu
            </span>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className="flex-1 p-4 prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[350px] text-sm leading-relaxed"
      />
    </div>
  );
}
