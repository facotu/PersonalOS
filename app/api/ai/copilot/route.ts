import { NextResponse } from "next/server";
import { z } from "zod";
import { AIService } from "@/lib/ai/ai-service";

const requestBodySchema = z.object({
  operation: z.enum([
    "summarizeNote",
    "extractActions",
    "analyzeRisk",
    "generateDailyBrief",
    "generateWeeklyReview",
  ]),
  noteTitle: z.string().min(1, "Tiêu đề ghi chú không được để trống."),
  noteContent: z.string().default(""),
  projectName: z.string().optional().nullable(),
  taskTitle: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = requestBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const output = await AIService.runCopilot(validation.data);

    return NextResponse.json({ success: true, data: output });
  } catch (err: any) {
    console.error("Error in AI Copilot API route:", err);
    return NextResponse.json(
      { error: err.message || "Không thể kết nối AI Copilot." },
      { status: 500 }
    );
  }
}
