import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .max(100, "Tên không được vượt quá 100 ký tự.")
    .optional()
    .nullable(),
});

export const updateUserSettingsSchema = z.object({
  language: z.enum(["vi-VN", "en-US"]).default("vi-VN"),
  timezone: z.string().min(1, "Vui lòng chọn múi giờ."),
  date_format: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).default("DD/MM/YYYY"),
  time_format: z.enum(["24h", "12h"]).default("24h"),
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  week_starts_on: z.number().int().min(0).max(6).default(1),
  default_view: z
    .enum(["dashboard", "tasks", "calendar", "projects"])
    .default("dashboard"),
  working_hours_start: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ."),
  working_hours_end: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ."),
  daily_brief_time: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ."),
});

export const updateNotificationPreferencesSchema = z.object({
  deadline_24h: z.boolean().default(true),
  deadline_1h: z.boolean().default(true),
  overdue: z.boolean().default(true),
  daily_brief: z.boolean().default(true),
  weekly_review: z.boolean().default(true),
  email_enabled: z.boolean().default(true),
  push_enabled: z.boolean().default(true),
  telegram_enabled: z.boolean().default(false),
  daily_brief_time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
