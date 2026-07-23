import { Tool } from "../types/Tool";
import { FoodMapper } from "../mappers/FoodMapper";
import {
  FoodSearchService,
  FOOD_SEARCH_SCORES,
  type FoodSearchHit,
} from "../services/FoodSearchService";

export type FoodToolConfidence = "high" | "medium" | "low";

export type FoodToolResult =
  | {
      status: "found";
      confidence: "high" | "medium";
      query: string;
      food: ReturnType<typeof FoodMapper.toPublicNutrition>;
      match: {
        score: number;
        reason: string;
      };
    }
  | {
      status: "needs_clarification";
      confidence: "low";
      query: string;
      message: string;
      suggestions: ReturnType<typeof FoodMapper.toSuggestion>[];
    }
  | {
      status: "not_found";
      confidence: "low";
      query: string;
      message: string;
      suggestions: [];
    }
  | {
      status: "error";
      confidence: "low";
      query: string;
      message: string;
    };

function confidenceFromScore(score: number): FoodToolConfidence {
  if (score >= FOOD_SEARCH_SCORES.startsWith) return "high"; // >= 80
  if (score >= FOOD_SEARCH_SCORES.contains) return "medium"; // >= 60
  return "low";
}

/**
 * Tool de nutrición conectado a FoodSearchService.
 * No conoce Firebase ni objetos RTDB crudos.
 */
export class FoodTool implements Tool {
  name = "getFoodInformation";

  description =
    "Busca un alimento en la base nutricional boliviana y devuelve calorías, " +
    "macronutrientes e índice glucémico si está disponible. " +
    "Si la coincidencia es baja, devuelve sugerencias para que el usuario aclare. " +
    "Úsala cuando pregunten por un alimento o su composición.";

  parameters = {
    type: "object",
    properties: {
      foodName: {
        type: "string",
        description:
          "Nombre del alimento a buscar (ej. plátano, banana, arroz)",
      },
    },
    required: ["foodName"],
  };

  constructor(
    private readonly searchService: FoodSearchService = new FoodSearchService()
  ) {}

  async execute(args: unknown): Promise<FoodToolResult> {
    const foodName = this.readFoodName(args);
    if (!foodName) {
      return {
        status: "error",
        confidence: "low",
        query: "",
        message: "Debes indicar el nombre del alimento (foodName).",
      };
    }

    try {
      const ranked = await this.searchService.searchRanked(foodName, 5);
      if (!ranked.length) {
        return {
          status: "not_found",
          confidence: "low",
          query: foodName,
          message: `No encontré alimentos parecidos a "${foodName}". Prueba con otro nombre.`,
          suggestions: [],
        };
      }

      const best = ranked[0];
      const confidence = confidenceFromScore(best.score);

      if (confidence === "low") {
        return {
          status: "needs_clarification",
          confidence: "low",
          query: foodName,
          message:
            `No estoy seguro de qué alimento es "${foodName}". ` +
            "¿Cuál de estas opciones buscabas?",
          suggestions: this.toSuggestions(ranked),
        };
      }

      return {
        status: "found",
        confidence,
        query: foodName,
        food: FoodMapper.toPublicNutrition(best.food),
        match: {
          score: best.score,
          reason: best.reason,
        },
      };
    } catch (error) {
      return {
        status: "error",
        confidence: "low",
        query: foodName,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo consultar la base de alimentos.",
      };
    }
  }

  private readFoodName(args: unknown): string {
    if (!args || typeof args !== "object") return "";
    const value = (args as { foodName?: unknown }).foodName;
    return typeof value === "string" ? value.trim() : "";
  }

  private toSuggestions(ranked: FoodSearchHit[]) {
    return ranked.map((hit) =>
      FoodMapper.toSuggestion(hit.food, hit.score, hit.reason)
    );
  }
}
