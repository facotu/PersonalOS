import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Tên dự án không được để trống.")
    .max(255, "Tên dự án không được vượt quá 255 ký tự."),
  goal: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
  status: z.enum(["Planning", "Active", "Paused", "Completed", "Archived"]).default("Active"),
  start_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  color: z.string().optional().default("#3b82f6"),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
