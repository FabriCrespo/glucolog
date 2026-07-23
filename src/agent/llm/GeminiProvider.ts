import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  type Content,
  type FunctionDeclaration,
} from "@google/genai";
import { ChatOptions, LLMProvider } from "./LLMProvider";
import { Message } from "../types/Message";
import { LLMChatResult } from "../types/LLMChatResult";
import { ToolDefinition } from "../types/ToolDefinition";

/**
 * Un solo turno con Gemini (@google/genai).
 * No ejecuta tools: eso lo hace DiabetesAgent.
 */
export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(model?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.client = new GoogleGenAI({ apiKey });
    this.model =
      model ?? process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<LLMChatResult> {
    const system = messages.find((m) => m.role === "system");
    const contents: Content[] = options?.providerContents
      ? (options.providerContents as Content[])
      : messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

    const definitions = options?.toolDefinitions ?? [];
    const declarations = definitions.map((d) => this.toDeclaration(d));

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: system?.content,
        ...(declarations.length
          ? {
              tools: [{ functionDeclarations: declarations }],
              toolConfig: {
                functionCallingConfig: {
                  mode: FunctionCallingConfigMode.AUTO,
                },
              },
            }
          : {}),
      },
    });

    const calls = response.functionCalls;
    if (calls?.length) {
      const modelContent = response.candidates?.[0]?.content;
      if (!modelContent) {
        return { kind: "text", text: response.text ?? "" };
      }

      return {
        kind: "tool_calls",
        modelContent,
        calls: calls.map((call) => ({
          id: call.id,
          name: call.name ?? "",
          args: (call.args ?? {}) as Record<string, unknown>,
        })),
      };
    }

    return {
      kind: "text",
      text: response.text ?? "",
    };
  }

  private toDeclaration(definition: ToolDefinition): FunctionDeclaration {
    return {
      name: definition.name,
      description: definition.description,
      parametersJsonSchema: definition.parameters as Record<string, unknown>,
    };
  }
}
