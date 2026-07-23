/**
 * Definición de tool lista para enviar a Gemini (functionDeclarations).
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: object;
}
