import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Tên công việc không được để trống.")
    .max(255, "Tên công việc không được vượt quá 255 ký tự."),
  description: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
  status: z.enum(["CHUA_LAM", "DANG_LAM", "CHO", "HOAN_THANH", "HUY"]).default("CHUA_LAM"),
  start_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  estimated_hours: z.number().min(0, "Giờ dự kiến không được âm.").default(0),
  energy_level: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  tag_ids: z.array(z.string().uuid()).optional().default([]),
});

export const quickAddTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Tên công việc không được để trống.")
    .max(255, "Tên công việc quá dài."),
  priority: z.enum(["P0", "P1", "P2", "P3"]).optional().default("P2"),
  due_date: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type QuickAddTaskInput = z.infer<typeof quickAddTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
