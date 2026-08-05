import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề ghi chú không được để trống.")
    .max(255, "Tiêu đề ghi chú không được vượt quá 255 ký tự."),
  content: z.any().optional().default({}),
  project_id: z.string().uuid().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
  is_pinned: z.boolean().default(false),
  ai_summary: z.string().optional().nullable(),
  ai_action_items: z.array(z.any()).optional().default([]),
  ai_decisions: z.array(z.any()).optional().default([]),
  ai_risks: z.array(z.any()).optional().default([]),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
