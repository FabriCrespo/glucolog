import type { Content, Part } from "@google/genai";
import { LLMProvider } from "../llm/LLMProvider";
import { Message } from "../types/Message";
import { AgentRequest } from "../types/AgentRequest";
import { AgentResponse } from "../types/AgentResponse";
import { Tool } from "../types/Tool";
import { FoodTool } from "../tools/FoodTool";
import { Planner } from "./Planner";
import { ToolRegistry } from "./ToolRegistry";
import { ContextBuilder } from "./ContextBuilder";

const MAX_TOOL_ROUNDS = 5;

/**
 * Motor del agente.
 *
 * Usuario → LLM → ¿tool? → ejecutar → LLM → … → respuesta final
 */
export class DiabetesAgent {
  private planner: Planner;
  private registry: ToolRegistry;
  private contextBuilder: ContextBuilder;

  constructor(
    private llm: LLMProvider,
    planner?: Planner,
    registry?: ToolRegistry,
    contextBuilder?: ContextBuilder
  ) {
    this.planner = planner ?? new Planner();
    this.registry = registry ?? new ToolRegistry();
    this.contextBuilder = contextBuilder ?? new ContextBuilder();

    this.registry.register(new FoodTool());
  }

  registerTool(tool: Tool) {
    this.registry.register(tool);
  }

  async chat(request: AgentRequest): Promise<AgentResponse> {
    await this.planner.plan();
    await this.contextBuilder.build();

    const toolDefinitions = this.registry.getDefinitions();
    const toolsUsed: string[] = [];

    const systemMessage: Message = {
      role: "system",
      content:
        "Eres GlucoLog AI, un asistente especializado en diabetes. " +
        "Responde siempre en español, con un tono claro y cercano. " +
        "Cuando el usuario pregunte por un alimento o su nutrición, usa la herramienta getFoodInformation. " +
        "Si la herramienta devuelve needs_clarification, pregunta al usuario cuál sugerencia es la correcta. " +
        "Explica los datos de forma sencilla. " +
        "Das solo información educativa. Nunca diagnostiques ni recetes tratamientos.",
    };

    const userMessage: Message = {
      role: "user",
      content: request.message,
    };

    // Historial nativo Gemini (permite varios tool rounds)
    let providerContents: Content[] | undefined;
    const baseMessages: Message[] = [systemMessage, userMessage];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const turn = await this.llm.chat(baseMessages, {
        toolDefinitions,
        providerContents,
      });

      if (turn.kind === "text") {
        return {
          answer: turn.text,
          metadata: {
            toolsUsed,
            toolsAvailable: toolDefinitions.map((t) => t.name),
            userId: request.userId,
            conversationId: request.conversationId ?? null,
            rounds: round + 1,
          },
        };
      }

      // Gemini pidió una o más tools
      const contents: Content[] = providerContents
        ? [...providerContents]
        : [
            {
              role: "user",
              parts: [{ text: request.message }],
            },
          ];

      contents.push(turn.modelContent as Content);

      const responseParts: Part[] = [];
      for (const call of turn.calls) {
        toolsUsed.push(call.name);
        let result: any;
        try {
          result = await this.registry.execute(call.name, call.args);
        } catch (error) {
          result = {
            error:
              error instanceof Error ? error.message : "Error al ejecutar tool",
          };
        }

        responseParts.push({
          functionResponse: {
            id: call.id,
            name: call.name,
            response:
              result && typeof result === "object"
                ? (result as Record<string, unknown>)
                : { result },
          },
        });
      }

      contents.push({
        role: "user",
        parts: responseParts,
      });

      providerContents = contents;
    }

    return {
      answer:
        "No pude completar la consulta con las herramientas disponibles. Intenta de nuevo.",
      metadata: {
        toolsUsed,
        toolsAvailable: toolDefinitions.map((t) => t.name),
        userId: request.userId,
        conversationId: request.conversationId ?? null,
        rounds: MAX_TOOL_ROUNDS,
      },
    };
  }
}
