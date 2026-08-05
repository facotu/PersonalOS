"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  Check,
  Plus,
  AlertTriangle,
  RefreshCw,
  Copy,
  FileText,
  ListTodo,
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AICopilotOutput, AIOperation, AIActionItem } from "@/lib/ai/types";
import { createTaskAction } from "@/lib/tasks/actions";
import { cn } from "@/lib/utils";

interface AICopilotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteTitle: string;
  noteContentText: string;
  projectName?: string | null;
  onInsertToNote?: (text: string) => void;
  onTaskCreatedSuccess?: () => void;
}

export function AICopilotDrawer({
  open,
  onOpenChange,
  noteTitle,
  noteContentText,
  projectName,
  onInsertToNote,
  onTaskCreatedSuccess,
}: AICopilotDrawerProps) {
  const [activeOperation, setActiveOperation] = React.useState<AIOperation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aiOutput, setAiOutput] = React.useState<AICopilotOutput | null>(null);

  // Selected Action Items for Confirmation Flow
  const [selectedActionIndexes, setSelectedActionIndexes] = React.useState<number[]>([]);
  const [creatingTasks, setCreatingTasks] = React.useState(false);

  const runAIOperation = async (op: AIOperation) => {
    setActiveOperation(op);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: op,
          noteTitle: noteTitle || "Ghi chú không tên",
          noteContent: noteContentText,
          projectName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể kết nối AI Copilot.");
      }

      setAiOutput(data.data);
      // Select all suggested action items by default for user review
      if (data.data.action_items && data.data.action_items.length > 0) {
        setSelectedActionIndexes(data.data.action_items.map((_: any, idx: number) => idx));
      }
    } catch (err: any) {
      console.error("AI Copilot Error:", err);
      setError(err.message || "Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActionIndex = (idx: number) => {
    setSelectedActionIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Create real tasks upon explicit user confirmation
  const handleConfirmCreateTasks = async () => {
    if (!aiOutput || !aiOutput.action_items || selectedActionIndexes.length === 0) return;

    setCreatingTasks(true);
    try {
      const selectedItems = selectedActionIndexes.map((idx) => aiOutput.action_items[idx]);

      for (const item of selectedItems) {
        await createTaskAction({
          title: item.title,
          priority: item.priority || "P2",
          due_date: item.due_date ? new Date(item.due_date).toISOString() : null,
          status: "CHUA_LAM",
          estimated_hours: 0,
          energy_level: "MEDIUM",
          tag_ids: [],
        });
      }

      toast({
        title: "Đã tạo công việc thành công!",
        description: `Đã khởi tạo ${selectedItems.length} công việc từ gợi ý của AI.`,
      });

      if (onTaskCreatedSuccess) onTaskCreatedSuccess();
      setSelectedActionIndexes([]);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể tạo công việc",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setCreatingTasks(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" /> AI Copilot Trợ Lý Thông Minh
          </SheetTitle>
          <SheetDescription>
            Phân tích nội dung ghi chú, rút trích công việc và hỗ trợ biên tập thông minh
          </SheetDescription>
        </SheetHeader>

        {/* Action Preset Buttons */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chọn thao tác AI
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAIOperation("summarizeNote")}
              disabled={loading}
              className="justify-start gap-1.5 h-9"
            >
              <FileText className="h-3.5 w-3.5 text-sky-400" /> Tóm tắt ghi chú
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAIOperation("extractActions")}
              disabled={loading}
              className="justify-start gap-1.5 h-9"
            >
              <ListTodo className="h-3.5 w-3.5 text-emerald-400" /> Trích Action Items
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAIOperation("analyzeRisk")}
              disabled={loading}
              className="justify-start gap-1.5 h-9"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Rút trích Rủi ro
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAIOperation("summarizeNote")}
              disabled={loading}
              className="justify-start gap-1.5 h-9"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Viết lại rõ ràng hơn
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 rounded-2xl border bg-accent/20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">
              AI đang phân tích dữ liệu ghi chú...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activeOperation && runAIOperation(activeOperation)}
              className="gap-1.5 text-xs text-rose-300 border-rose-500/40 hover:bg-rose-500/20"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Thử lại
            </Button>
          </div>
        )}

        {/* Output Display Area */}
        {aiOutput && !loading && (
          <div className="space-y-5 animate-in fade-in-50 pt-2">
            {/* Summary */}
            {aiOutput.summary && (
              <div className="p-4 rounded-xl border bg-accent/30 space-y-1.5">
                <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Tóm tắt nội dung</span>
                  {onInsertToNote && (
                    <button
                      onClick={() => onInsertToNote(aiOutput.summary)}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] font-normal"
                    >
                      <Copy className="h-3 w-3" /> Chèn vào Note
                    </button>
                  )}
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{aiOutput.summary}</p>
              </div>
            )}

            {/* AI Action Item -> Task Confirmation Flow */}
            {aiOutput.action_items && aiOutput.action_items.length > 0 && (
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="h-4 w-4" /> AI Đề Xuất {aiOutput.action_items.length} Công Việc
                  </h4>
                </div>

                <div className="space-y-2">
                  {aiOutput.action_items.map((item: AIActionItem, idx: number) => {
                    const isSelected = selectedActionIndexes.includes(idx);
                    return (
                      <label
                        key={idx}
                        className={cn(
                          "flex items-start space-x-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors",
                          isSelected ? "border-primary/50 bg-primary/5" : "border-border/60 bg-accent/10 opacity-70"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleActionIndex(idx)}
                          className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>Ưu tiên: {item.priority || "P2"}</span>
                            {item.due_date && <span>Hạn: {item.due_date}</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Confirm Create Tasks Button */}
                <Button
                  onClick={handleConfirmCreateTasks}
                  disabled={creatingTasks || selectedActionIndexes.length === 0}
                  size="sm"
                  className="w-full gap-1.5 shadow-sm text-xs"
                >
                  {creatingTasks ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Tạo {selectedActionIndexes.length} Công Việc Đã Chọn
                </Button>
              </div>
            )}

            {/* Risks */}
            {aiOutput.risks && aiOutput.risks.length > 0 && (
              <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 space-y-1.5">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Vấn Đề & Rủi Ro Phát Hiện
                </h4>
                <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
                  {aiOutput.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
