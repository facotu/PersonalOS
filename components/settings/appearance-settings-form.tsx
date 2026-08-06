"use client";

import * as React from "react";
import { Laptop, Globe, Calendar, Clock, Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";

import { fetchSettingsData, updateUserSettingsAction } from "@/lib/settings/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UpdateUserSettingsInput } from "@/lib/settings/schemas";

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (GMT+7) — Việt Nam" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
];

export function AppearanceSettingsForm() {
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  const [settings, setSettings] = React.useState<UpdateUserSettingsInput>({
    language: "vi-VN",
    timezone: "Asia/Ho_Chi_Minh",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    theme: "dark",
    week_starts_on: 1,
    default_view: "dashboard",
    working_hours_start: "08:00",
    working_hours_end: "17:30",
    daily_brief_time: "07:30",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["settings-data"],
    queryFn: fetchSettingsData,
  });

  React.useEffect(() => {
    if (data?.settings) {
      setSettings({
        language: (data.settings.language as "vi-VN" | "en-US") || "vi-VN",
        timezone: data.settings.timezone || "Asia/Ho_Chi_Minh",
        date_format: (data.settings.date_format as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD") || "DD/MM/YYYY",
        time_format: (data.settings.time_format as "24h" | "12h") || "24h",
        theme: (data.settings.theme as "dark" | "light" | "system") || "dark",
        week_starts_on: data.settings.week_starts_on ?? 1,
        default_view: (data.settings.default_view as "dashboard" | "tasks" | "calendar" | "projects") || "dashboard",
        working_hours_start: data.settings.working_hours_start ? data.settings.working_hours_start.substring(0, 5) : "08:00",
        working_hours_end: data.settings.working_hours_end ? data.settings.working_hours_end.substring(0, 5) : "17:30",
        daily_brief_time: data.settings.daily_brief_time ? data.settings.daily_brief_time.substring(0, 5) : "07:30",
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateUserSettingsInput) => updateUserSettingsAction(input),
    onSuccess: (updated) => {
      // Áp dụng theme lên hệ thống
      if (updated.theme) {
        setTheme(updated.theme);
      }
      toast({
        title: "Cấu hình hệ thống đã lưu!",
        description: "Các tùy chọn giao diện và thời gian của bạn đã được cập nhật.",
      });
      queryClient.invalidateQueries({ queryKey: ["settings-data"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Không thể lưu cấu hình.";
      toast({
        variant: "destructive",
        title: "Lỗi lưu cấu hình",
        description: msg,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="h-48 rounded-2xl border bg-card/40 animate-pulse" />;
  }

  return (
    <Card className="bg-card/60 backdrop-blur-md shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Laptop className="h-4 w-4 text-primary" /> Giao Diện & Thời Gian
        </CardTitle>
        <CardDescription className="text-xs">
          Tùy chỉnh chủ đề ứng dụng, múi giờ, định dạng ngày tháng và thời gian làm việc
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Theme & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Chủ Đề Giao Diện
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as "dark" | "light" | "system" })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="dark">Chế độ Tối (Mặc định)</option>
                <option value="light">Chế độ Sáng</option>
                <option value="system">Theo hệ thống</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ngôn Ngữ Hệ Thống
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value as "vi-VN" | "en-US" })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="vi-VN">Tiếng Việt (vi-VN)</option>
                <option value="en-US">English (en-US)</option>
              </select>
            </div>
          </div>

          {/* Timezone & Default View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-sky-400" /> Múi Giờ Hệ Thống
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trang Chủ Mặc Định
              </label>
              <select
                value={settings.default_view}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_view: e.target.value as "dashboard" | "tasks" | "calendar" | "projects",
                  })
                }
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="dashboard">Dashboard (Trung tâm điều hành)</option>
                <option value="tasks">Công việc (Tasks List)</option>
                <option value="calendar">Lịch trình (Calendar)</option>
                <option value="projects">Dự án (Projects)</option>
              </select>
            </div>
          </div>

          {/* Date & Time Formats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Định dạng ngày
              </label>
              <select
                value={settings.date_format}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    date_format: e.target.value as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
                  })
                }
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Ví dụ: 06/08/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (Ví dụ: 08/06/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (Ví dụ: 2026-08-06)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> Định dạng giờ
              </label>
              <select
                value={settings.time_format}
                onChange={(e) => setSettings({ ...settings, time_format: e.target.value as "24h" | "12h" })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="24h">24 Giờ (Ví dụ: 17:30)</option>
                <option value="12h">12 Giờ AM/PM (Ví dụ: 05:30 PM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ngày bắt đầu tuần
              </label>
              <select
                value={settings.week_starts_on}
                onChange={(e) => setSettings({ ...settings, week_starts_on: Number(e.target.value) })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value={1}>Thứ Hai (Mặc định)</option>
                <option value={0}>Chủ Nhật</option>
                <option value={6}>Thứ Bảy</option>
              </select>
            </div>
          </div>

          {/* Working Hours & Daily Brief */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Giờ bắt đầu làm việc
              </label>
              <input
                type="time"
                value={settings.working_hours_start}
                onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Giờ kết thúc làm việc
              </label>
              <input
                type="time"
                value={settings.working_hours_end}
                onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-amber-300">
                Giờ nhận Tin vắn hàng ngày
              </label>
              <input
                type="time"
                value={settings.daily_brief_time}
                onChange={(e) => setSettings({ ...settings, daily_brief_time: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-accent/30 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>
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
