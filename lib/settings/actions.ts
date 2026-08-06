"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  UserProfile,
  UserSettingsRecord,
  NotificationPreferencesRecord,
  SettingsPageData,
} from "./types";
import {
  UpdateProfileInput,
  UpdateUserSettingsInput,
  UpdateNotificationPreferencesInput,
} from "./schemas";

export async function fetchSettingsData(): Promise<SettingsPageData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  // 1. Get profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    throw new Error("Không thể tải thông tin cá nhân.");
  }

  // 2. Get user settings, upsert if not exists
  let { data: settings, error: settingsErr } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings && !settingsErr) {
    // Tạo mặc định
    const { data: newSettings, error: createErr } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
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
      })
      .select()
      .single();

    if (!createErr && newSettings) {
      settings = newSettings;
    }
  }

  // 3. Get notification preferences, upsert if not exists
  let { data: notifications, error: notiErr } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!notifications && !notiErr) {
    // Tạo mặc định
    const { data: newNoti, error: createNotiErr } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: user.id,
        deadline_24h: true,
        deadline_1h: true,
        overdue: true,
        daily_brief: true,
        weekly_review: true,
        email_enabled: true,
        push_enabled: true,
        telegram_enabled: false,
        daily_brief_time: "07:30",
        timezone: "Asia/Ho_Chi_Minh",
      })
      .select()
      .single();

    if (!createNotiErr && newNoti) {
      notifications = newNoti;
    }
  }

  return {
    profile: profile as UserProfile,
    settings: settings as UserSettingsRecord | null,
    notifications: notifications as NotificationPreferencesRecord | null,
  };
}

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<UserProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error("Không thể cập nhật thông tin hồ sơ.");
  }

  revalidatePath("/settings");
  return data as UserProfile;
}

export async function updateUserSettingsAction(
  input: UpdateUserSettingsInput
): Promise<UserSettingsRecord> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      language: input.language,
      timezone: input.timezone,
      date_format: input.date_format,
      time_format: input.time_format,
      theme: input.theme,
      week_starts_on: input.week_starts_on,
      default_view: input.default_view,
      working_hours_start: input.working_hours_start,
      working_hours_end: input.working_hours_end,
      daily_brief_time: input.daily_brief_time,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Lỗi cập nhật cấu hình hệ thống:", error);
    throw new Error("Không thể cập nhật cấu hình hệ thống.");
  }

  revalidatePath("/settings");
  return data as UserSettingsRecord;
}

export async function updateNotificationPreferencesAction(
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferencesRecord> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      deadline_24h: input.deadline_24h,
      deadline_1h: input.deadline_1h,
      overdue: input.overdue,
      daily_brief: input.daily_brief,
      weekly_review: input.weekly_review,
      email_enabled: input.email_enabled,
      push_enabled: input.push_enabled,
      telegram_enabled: input.telegram_enabled,
      daily_brief_time: input.daily_brief_time,
      timezone: input.timezone,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Lỗi cập nhật cấu hình thông báo:", error);
    throw new Error("Không thể cập nhật cấu hình thông báo.");
  }

  revalidatePath("/settings");
  return data as NotificationPreferencesRecord;
}
