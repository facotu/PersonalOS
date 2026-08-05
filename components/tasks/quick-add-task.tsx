"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createTaskAction } from "@/lib/tasks/actions";
import { TaskPriority } from "@/lib/tasks/types";

interface QuickAddTaskProps {
  onTaskCreated: () => void;
  defaultPriority?: TaskPriority;
}

export function QuickAddTask({ onTaskCreated, defaultPriority = "P2" }: QuickAddTaskProps) {
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>(defaultPriority);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTaskAction({
        title: title.trim(),
        priority,
        status: "CHUA_LAM",
        estimated_hours: 0,
        energy_level: "MEDIUM",
        tag_ids: [],
      });

      setTitle("");
      toast({
        title: "Đã thêm công việc nhanh!",
        description: `"${title.trim()}" đã được lưu vào danh sách.`,
      });
      onTaskCreated();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể thêm công việc",
        description: err.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-2 rounded-xl border bg-card/60 backdrop-blur-md shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30"
    >
      <div className="flex-1 flex items-center gap-2 px-2">
        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Thêm nhanh công việc mới... (Bấm Enter để tạo)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none border-none focus:ring-0"
          disabled={loading}
        />
      </div>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        className="h-8 rounded-lg border bg-accent/30 text-xs px-2 text-muted-foreground focus:text-foreground outline-none"
        disabled={loading}
      >
        <option value="P0">P0 Khẩn cấp</option>
        <option value="P1">P1 Cao</option>
        <option value="P2">P2 Bình thường</option>
        <option value="P3">P3 Thấp</option>
      </select>

      <Button
        type="submit"
        size="sm"
        disabled={loading || !title.trim()}
        className="h-8 gap-1.5 px-3 text-xs shadow-sm"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Thêm
      </Button>
    </form>
  );
}
