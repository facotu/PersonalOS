"use client";

import * as React from "react";
import { Bell, Clock, Save, Loader2, Moon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { NotificationPreferences } from "@/lib/reminders/types";
import { fetchNotificationPreferences, updateNotificationPreferencesAction } from "@/lib/reminders/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function ReminderSettingsForm() {
  const queryClient = useQueryClient();

  const [prefs, setPrefs] = React.useState<Partial<NotificationPreferences>>({
    deadline_24h: true,
    deadline_1h: true,
    overdue: true,
    daily_brief: true,
    weekly_review: true,
    quiet_hours_enabled: true,
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => fetchNotificationPreferences(),
  });

  React.useEffect(() => {
    if (data) {
      setPrefs(data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<NotificationPreferences>) =>
      updateNotificationPreferencesAction(input),
    onSuccess: () => {
      toast({
        title: "Đã lưu cấu hình thông báo!",
        description: "Tùy chọn nhắc việc của bạn đã được cập nhật thành công.",
      });
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(prefs);
  };

  if (isLoading) {
    return <div className="h-48 rounded-2xl border bg-card/40 animate-pulse" />;
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Cấu Hình Thông Báo & Nhắc Việc
        </CardTitle>
        <CardDescription className="text-xs">
          Tùy chỉnh thời điểm nhận nhắc việc, hạn chót công việc và chế độ Không làm phiền
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Task & Project Preset Checkboxes */}
          <div className="space-y-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
              Nhắc Việc Task & Dự Án
            </span>

            <label className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-lg hover:bg-accent/20">
              <input
                type="checkbox"
                checked={prefs.deadline_24h ?? true}
                onChange={(e) => setPrefs({ ...prefs, deadline_24h: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Nhắc trước 24 giờ khi đến hạn</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-lg hover:bg-accent/20">
              <input
                type="checkbox"
                checked={prefs.deadline_1h ?? true}
                onChange={(e) => setPrefs({ ...prefs, deadline_1h: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Nhắc trước 2 giờ (hoặc 30 phút cho Sự kiện)</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-lg hover:bg-accent/20">
              <input
                type="checkbox"
                checked={prefs.overdue ?? true}
                onChange={(e) => setPrefs({ ...prefs, overdue: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Cảnh báo khi công việc bị quá hạn</span>
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-indigo-400" /> Chế Độ Không Làm Phiền (Quiet Hours)
              </span>
              <input
                type="checkbox"
                checked={prefs.quiet_hours_enabled ?? true}
                onChange={(e) => setPrefs({ ...prefs, quiet_hours_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pl-2">
              <div className="space-y-1">
                <label className="text-muted-foreground">Bắt đầu từ</label>
                <input
                  type="time"
                  value={prefs.quiet_hours_start || "22:00"}
                  onChange={(e) => setPrefs({ ...prefs, quiet_hours_start: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-accent/30 px-3 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Kết thúc lúc</label>
                <input
                  type="time"
                  value={prefs.quiet_hours_end || "07:00"}
                  onChange={(e) => setPrefs({ ...prefs, quiet_hours_end: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-accent/30 px-3 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pl-2 italic">
              * Trong khoảng thời gian này, các thông báo sẽ được trì hoãn đến khi hết chế độ Không làm phiền.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="gap-1.5 shadow-md"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu Cấu Hình
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
