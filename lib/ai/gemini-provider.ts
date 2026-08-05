import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIProviderResult } from "@/lib/ai/provider";
import { AICopilotParams, aiCopilotOutputSchema } from "@/lib/ai/types";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private modelName = "gemini-1.5-flash";

  async generateCopilot(params: AICopilotParams): Promise<AIProviderResult> {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback mock if API key is not configured in environment
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using graceful fallback response.");
      return this.getFallbackMockResult(params, startTime);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const prompt = `
Bạn là AI Copilot cho hệ thống Personal OS. Hãy phân tích ghi chú sau và trả về JSON chuẩn xác theo đúng schema dưới đây.

YÊU CẦU JSON OUTPUT STRICT SCHEMA:
{
  "summary": "Tóm tắt ngắn gọn 1-2 câu tiếng Việt",
  "action_items": [
    {
      "title": "Tên công việc đề xuất",
      "priority": "P0" hoặc "P1" hoặc "P2" hoặc "P3",
      "due_date": "YYYY-MM-DD" hoặc null
    }
  ],
  "risks": ["Vấn đề/Rủi ro 1", "Rủi ro 2"],
  "deadlines": ["Mốc thời hạn 1", "Mốc thời hạn 2"],
  "rewritten_content": "Phiên bản viết lại rõ ràng chuyên nghiệp hơn (nếu được yêu cầu)"
}

THÔNG TIN GHI CHÚ:
- Tiêu đề: ${params.noteTitle}
- Nội dung: ${params.noteContent}
- Dự án liên kết: ${params.projectName || "Không có"}
- Thao tác yêu cầu: ${params.operation}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const latencyMs = Date.now() - startTime;

      let rawJson;
      try {
        rawJson = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse Gemini JSON:", responseText);
        return this.getFallbackMockResult(params, startTime);
      }

      const parsedOutput = aiCopilotOutputSchema.parse(rawJson);

      return {
        output: parsedOutput,
        inputTokens: Math.round(prompt.length / 4),
        outputTokens: Math.round(responseText.length / 4),
        latencyMs,
        model: this.modelName,
      };
    } catch (err) {
      console.error("Gemini API execution error:", err);
      return this.getFallbackMockResult(params, startTime);
    }
  }

  private getFallbackMockResult(params: AICopilotParams, startTime: number): AIProviderResult {
    const latencyMs = Date.now() - startTime;
    return {
      output: {
        summary: `Tóm tắt ghi chú "${params.noteTitle}": Tập trung vào các mốc công việc trọng tâm và hoàn thiện đúng tiến độ.`,
        action_items: [
          {
            title: `Rà soát nội dung "${params.noteTitle}"`,
            priority: "P1",
            due_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
          },
        ],
        risks: ["Cần đảm bảo dữ liệu ghi chú được lưu trữ chính xác."],
        deadlines: ["Hoàn thành rà soát trong tuần này."],
        rewritten_content: `Nội dung đã được biên tập lại: ${params.noteContent}`,
      },
      inputTokens: 150,
      outputTokens: 100,
      latencyMs,
      model: `${this.modelName}-fallback`,
    };
  }
}
