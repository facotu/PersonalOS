"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  User,
  Laptop,
  Bell,
  Shield,
  Cpu,
} from "lucide-react";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { AppearanceSettingsForm } from "@/components/settings/appearance-settings-form";
import { ReminderSettingsForm } from "@/components/reminders/reminder-settings-form";
import { SecuritySettingsForm } from "@/components/settings/security-settings-form";
import { AutomationSettingsCard } from "@/components/settings/automation-settings-card";
import { cn } from "@/lib/utils";

type TabId = "profile" | "appearance" | "notifications" | "security" | "automation";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "profile", label: "Hồ Sơ", icon: User },
  { id: "appearance", label: "Hệ Thống & Giao Diện", icon: Laptop },
  { id: "notifications", label: "Thông Báo & Nhắc Việc", icon: Bell },
  { id: "security", label: "Bảo Mật & Passkeys", icon: Shield },
  { id: "automation", label: "Tự Động Hóa n8n", icon: Cpu },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Đọc tab từ query param hoặc mặc định là "profile"
  const initialTab = (searchParams.get("tab") as TabId) || "profile";
  const [activeTab, setActiveTab] = React.useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "profile"
  );

  // Đồng bộ tab với URL query param để reload hoặc link trực tiếp hoạt động
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/settings?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary animate-spin-slow" /> Cấu Hình Hệ Thống (Settings)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tùy chọn cá nhân, cấu hình thời gian làm việc, bảo mật Passkeys và kết nối tự động hóa n8n
          </p>
        </div>
      </div>

      {/* Tab Navigation Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 text-left w-full relative",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-settings-tab"
                      className="absolute inset-0 bg-primary rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <tab.icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents Pane */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {activeTab === "profile" && <ProfileSettingsForm />}
              {activeTab === "appearance" && <AppearanceSettingsForm />}
              {activeTab === "notifications" && <ReminderSettingsForm />}
              {activeTab === "security" && <SecuritySettingsForm />}
              {activeTab === "automation" && <AutomationSettingsCard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
