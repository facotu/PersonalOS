import { AICopilotParams, AICopilotOutput } from "@/lib/ai/types";

export interface AIProviderResult {
  output: AICopilotOutput;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

export interface AIProvider {
  name: string;
  generateCopilot(params: AICopilotParams): Promise<AIProviderResult>;
}
