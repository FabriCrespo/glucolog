import { Tool } from "../types/Tool";
import { ToolDefinition } from "../types/ToolDefinition";

/**
 * Registro de tools indexado por nombre (O(1)).
 * También expone definiciones para Gemini vía getDefinitions().
 */
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): ToolDefinition[] {
    return this.getTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }

  async execute(name: string, args: any): Promise<any> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool no registrada: ${name}`);
    }
    return tool.execute(args ?? {});
  }
}
