import { z } from "zod";

export type AIOperation =
  | 'summarizeNote'
  | 'extractActions'
  | 'analyzeRisk'
  | 'generateDailyBrief'
  | 'generateWeeklyReview';

export interface AICopilotParams {
  operation: AIOperation;
  noteTitle: string;
  noteContent: string;
  projectName?: string | null;
  taskTitle?: string | null;
}

export const aiActionItemSchema = z.object({
  title: z.string(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
  due_date: z.string().nullable().optional(),
});

export const aiCopilotOutputSchema = z.object({
  summary: z.string().default(""),
  action_items: z.array(aiActionItemSchema).default([]),
  risks: z.array(z.string()).default([]),
  deadlines: z.array(z.string()).default([]),
  rewritten_content: z.string().optional(),
  suggested_project: z.string().optional().nullable(),
});

export type AIActionItem = z.infer<typeof aiActionItemSchema>;
export type AICopilotOutput = z.infer<typeof aiCopilotOutputSchema>;
