import { createClient } from "@/lib/supabase/server";
import { GeminiProvider } from "@/lib/ai/gemini-provider";
import { AICopilotParams, AICopilotOutput } from "@/lib/ai/types";

export class AIService {
  private static provider = new GeminiProvider();

  static async runCopilot(params: AICopilotParams): Promise<AICopilotOutput> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập để sử dụng AI Copilot.");
    }

    let status = "SUCCESS";
    let providerResult;

    try {
      providerResult = await this.provider.generateCopilot(params);
    } catch (err: any) {
      status = "FAILED";
      console.error("AIService execution error:", err);
      throw new Error("Không thể xử lý yêu cầu AI. Vui lòng thử lại sau.");
    } finally {
      if (providerResult) {
        // Log AI usage without sensitive prompt text
        const estimatedCost =
          (providerResult.inputTokens * 0.0000005) +
          (providerResult.outputTokens * 0.0000015);

        await supabase.from("ai_usage_logs").insert({
          user_id: user.id,
          provider: this.provider.name,
          model: providerResult.model,
          operation: params.operation,
          input_tokens: providerResult.inputTokens,
          output_tokens: providerResult.outputTokens,
          estimated_cost: estimatedCost,
          latency: providerResult.latencyMs,
          status,
        });
      }
    }

    return providerResult.output;
  }
}
