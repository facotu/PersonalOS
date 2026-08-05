import { z } from "zod";

export const createEventObjectSchema = z.object({
  title: z
    .string()
    .min(1, "Tên sự kiện không được để trống.")
    .max(255, "Tên sự kiện không được vượt quá 255 ký tự."),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, "Thời gian bắt đầu không được để trống."),
  end_time: z.string().min(1, "Thời gian kết thúc không được để trống."),
  is_all_day: z.boolean().default(false),
  location: z.string().optional().nullable(),
  event_type: z.enum(["Task", "Meeting", "Personal", "Reminder"]).default("Meeting"),
  project_id: z.string().uuid().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
});

export const createEventSchema = createEventObjectSchema.refine(
  (data) => new Date(data.end_time) >= new Date(data.start_time),
  {
    message: "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.",
    path: ["end_time"],
  }
);

export const updateEventSchema = createEventObjectSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
