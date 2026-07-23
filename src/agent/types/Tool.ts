export interface Tool {
  name: string;
  description: string;
  /** JSON Schema de parámetros (formato Gemini / OpenAI). */
  parameters: object;
  execute(args: any): Promise<any>;
}
