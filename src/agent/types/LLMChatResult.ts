/**
 * Resultado de un turno del LLM.
 * El agente decide: ejecutar tools o devolver la respuesta final.
 */
export type ToolCallRequest = {
  id?: string;
  name: string;
  args: Record<string, unknown>;
};

export type LLMChatResult =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "tool_calls";
      calls: ToolCallRequest[];
      /** Contenido crudo del modelo (con functionCall) para el historial Gemini. */
      modelContent: unknown;
    };
