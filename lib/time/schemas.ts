import { z } from "zod";

export const startTimerSchema = z.object({
  task_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  is_billable: z.boolean().default(false),
  hourly_rate: z.number().min(0).optional().nullable(),
});

export const manualTimeEntryObjectSchema = z.object({
  task_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  started_at: z.string().min(1, "Thời gian bắt đầu không được để trống."),
  ended_at: z.string().min(1, "Thời gian kết thúc không được để trống."),
  is_billable: z.boolean().default(false),
  hourly_rate: z.number().min(0).optional().nullable(),
  focus_score: z.number().int().min(1).max(10).optional().nullable(),
});

export const manualTimeEntrySchema = manualTimeEntryObjectSchema.refine(
  (data) => new Date(data.ended_at) > new Date(data.started_at),
  {
    message: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.",
    path: ["ended_at"],
  }
);

export const updateTimeEntrySchema = manualTimeEntryObjectSchema.partial();

export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type ManualTimeEntryInput = z.infer<typeof manualTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
