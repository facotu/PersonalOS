"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Trash2,
  Filter,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { NotificationItem, NotificationFilterOptions, ReminderSourceType } from "@/lib/reminders/types";
import {
  fetchNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  snoozeNotificationAction,
  dismissNotificationAction,
} from "@/lib/reminders/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = React.useState<"all" | "unread" | "read">("all");
  const [sourceType, setSourceType] = React.useState<ReminderSourceType | undefined>(undefined);

  const filterOptions: NotificationFilterOptions = {
    status: filterStatus,
    source_type: sourceType,
  };

  // Query Notifications
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications-center", filterOptions],
    queryFn: () => fetchNotifications(filterOptions),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadAction(),
    onSuccess: () => {
      toast({ title: "Đã đánh dấu tất cả thông báo là đã đọc" });
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, preset }: { id: string; preset: "15m" | "30m" | "1h" | "tomorrow_9am" }) =>
      snoozeNotificationAction(id, preset),
    onSuccess: () => {
      toast({ title: "Đã báo lại thông báo thành công" });
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Không thể báo lại",
        description: err.message,
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissNotificationAction(id),
    onSuccess: () => {
      toast({ title: "Đã bỏ qua thông báo" });
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" /> Trung Tâm Thông Báo (Notification Center)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tất cả thông báo, nhắc việc và mốc thời gian hạn chót
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            variant="outline"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <CheckCheck className="h-4 w-4" /> Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 backdrop-blur-md">
        <div className="flex items-center space-x-1">
          <Button
            variant={filterStatus === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="h-8 text-xs font-semibold"
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === "unread" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("unread")}
            className="h-8 text-xs font-semibold"
          >
            Chưa đọc ({unreadCount})
          </Button>
        </div>

        {/* Source Type Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sourceType || ""}
            onChange={(e) => setSourceType((e.target.value as ReminderSourceType) || undefined)}
            className="h-8 rounded-lg border bg-accent/30 text-xs px-2.5 text-foreground outline-none"
          >
            <option value="">-- Tất cả nguồn --</option>
            <option value="TASK">Task (Công việc)</option>
            <option value="PROJECT">Project (Dự án)</option>
            <option value="CALENDAR_EVENT">Calendar Event (Sự kiện)</option>
          </select>
        </div>
      </div>

      {/* Notifications Main List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Không thể tải danh sách thông báo"
          description="Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8 text-primary" />}
          title="TẤT CẢ ĐÃ XONG"
          description="Hiện chưa có thông báo mới nào phù hợp với bộ lọc."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "group flex items-start justify-between gap-3 p-4 rounded-xl border transition-all duration-200 shadow-sm",
                !n.is_read
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                  : "bg-card/60 border-border/60 hover:bg-accent/20"
              )}
            >
              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{n.title}</span>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                  {n.metadata?.source_type && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-accent/40 text-muted-foreground uppercase">
                      {n.metadata.source_type}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>

                <div className="flex items-center space-x-3 text-[11px] text-muted-foreground font-mono pt-1">
                  <span>
                    {new Date(n.created_at).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {n.metadata?.snoozed_until && (
                    <span className="text-amber-400 font-sans font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Báo lại đến:{" "}
                      {new Date(n.metadata.snoozed_until).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 shrink-0">
                {n.link_url && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Mở nội dung liên quan"
                  >
                    <Link href={n.link_url}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {/* Full Snooze Presets Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="text-xs space-y-0.5">
                    {!n.is_read && (
                      <DropdownMenuItem onClick={() => markReadMutation.mutate(n.id)}>
                        <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Đánh dấu đã đọc
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: n.id, preset: "15m" })}>
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> Báo lại sau 15 phút
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: n.id, preset: "30m" })}>
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> Báo lại sau 30 phút
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: n.id, preset: "1h" })}>
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> Báo lại sau 1 giờ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: n.id, preset: "tomorrow_9am" })}>
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> Ngày mai 09:00 AM
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dismissMutation.mutate(n.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5 text-rose-400" /> Bỏ qua thông báo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
