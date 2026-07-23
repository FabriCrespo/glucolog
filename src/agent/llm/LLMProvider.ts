import { Message } from "../types/Message";
import { ToolDefinition } from "../types/ToolDefinition";
import { LLMChatResult } from "../types/LLMChatResult";

export interface ChatOptions {
  /** Definiciones de tools para function calling (desde ToolRegistry.getDefinitions()). */
  toolDefinitions?: ToolDefinition[];
  /**
   * Historial en formato nativo del proveedor (p.ej. Content[] de Gemini).
   * Si se pasa, tiene prioridad sobre messages para el cuerpo de la conversación.
   */
  providerContents?: unknown[];
}

export interface LLMProvider {
  /**
   * Un turno del LLM. Puede devolver texto final o tool_calls.
   * El agente (DiabetesAgent) ejecuta el bucle y las tools.
   */
  chat(messages: Message[], options?: ChatOptions): Promise<LLMChatResult>;
}
