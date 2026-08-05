"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { NotificationItem } from "@/lib/reminders/types";
import { fetchNotifications, markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/reminders/actions";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications-popover"],
    queryFn: () => fetchNotifications({ limit: 5 }),
    refetchInterval: 15000, // Check for new reminders every 15 seconds
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-popover"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Thông báo & Nhắc việc"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border bg-card/95 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-primary" /> Thông Báo & Nhắc Việc
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px]">
                {unreadCount} chưa đọc
              </span>
            )}
          </span>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="text-muted-foreground hover:text-primary flex items-center gap-1 font-medium text-[11px]"
            >
              <CheckCheck className="h-3 w-3" /> Đọc tất cả
            </button>
          )}
        </div>

        {/* Notification Items List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50 text-xs">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-xs">Đang kiểm tra thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              Hiện chưa có thông báo mới.
            </div>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) markReadMutation.mutate(n.id);
                  if (n.link_url) {
                    setOpen(false);
                  }
                }}
                className={cn(
                  "p-3 flex items-start space-x-2.5 hover:bg-accent/40 transition-colors cursor-pointer",
                  !n.is_read && "bg-primary/5 font-medium"
                )}
              >
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground line-clamp-1">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(n.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {n.link_url && (
                  <Link
                    href={n.link_url}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-primary shrink-0 p-1"
                    title="Mở nội dung chi tiết"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t bg-accent/20 text-center">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-primary hover:underline block py-1"
          >
            Xem tất cả thông báo →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
