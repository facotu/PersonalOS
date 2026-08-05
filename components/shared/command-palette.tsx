"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Timer,
  FileText,
  BarChart3,
  Award,
  Plus,
  Play,
} from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { toast } from "@/components/ui/use-toast";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Nhập từ khóa hoặc lệnh nhanh..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy lệnh phù hợp.</CommandEmpty>
        
        {/* Quick Actions */}
        <CommandGroup heading="Hành động nhanh">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                toast({
                  title: "Tạo công việc mới",
                  description: "Tính năng sẽ khả thi ở Phase 4.",
                });
              })
            }
          >
            <Plus className="mr-2 h-4 w-4 text-primary" />
            <span>Tạo Công Việc Mới...</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                toast({
                  title: "Bắt đầu đếm giờ",
                  description: "Tính năng sẽ khả thi ở Phase 8.",
                });
              })
            }
          >
            <Play className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Bắt Đầu Live Timer</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Navigation */}
        <CommandGroup heading="Đi tới trang">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/tasks"))}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Công việc</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Dự án</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/calendar"))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Lịch</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/time-tracking"))}
          >
            <Timer className="mr-2 h-4 w-4" />
            <span>Time Tracking</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/notes"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Ghi chú</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/analytics"))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/reviews"))}
          >
            <Award className="mr-2 h-4 w-4" />
            <span>Báo cáo tuần</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
