"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { ReminderSettingsForm } from "@/components/reminders/reminder-settings-form";
import { AutomationSettingsCard } from "@/components/settings/automation-settings-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" /> Cấu Hình Hệ Thống (Settings)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tùy chọn cá nhân, thông báo & nhắc việc, tự động hóa n8n và thiết lập tài khoản
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <ReminderSettingsForm />
        <AutomationSettingsCard />
      </div>
    </div>
  );
}
