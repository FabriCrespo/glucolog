import type { Food } from "../models/Food";
import type { FoodRepository } from "../repositories/FoodRepository";
import { RTDBFoodRepository } from "../repositories/RTDBFoodRepository";
import {
  FOOD_SEARCH_SCORES,
  normalizeFoodQuery,
  rankFoodsByQuery,
  type FoodMatchReason,
  type FoodRankHit,
} from "@/lib/food/smartFoodSearch";

export { FOOD_SEARCH_SCORES };
export type { FoodMatchReason };

export type FoodSearchHit = {
  food: Food;
  score: number;
  reason: FoodMatchReason;
};

/**
 * Motor de búsqueda del agente.
 * Usa el mismo ranking que foodbank (lib/food/smartFoodSearch).
 */
export class FoodSearchService {
  constructor(
    private readonly repository: FoodRepository = new RTDBFoodRepository()
  ) {}

  async search(query: string): Promise<Food | null> {
    const foods = await this.repository.getAll();
    return this.findBestMatch(query, foods);
  }

  async searchRanked(query: string, limit = 5): Promise<FoodSearchHit[]> {
    const foods = await this.repository.getAll();
    return this.rank(query, foods).slice(0, limit);
  }

  findBestMatch(query: string, foods: Food[]): Food | null {
    const ranked = this.rank(query, foods);
    if (!ranked.length) return null;
    if (ranked[0].score < FOOD_SEARCH_SCORES.levenshtein) return null;
    return ranked[0].food;
  }

  normalize(text: string): string {
    return normalizeFoodQuery(text);
  }

  calculateScore(query: string, foodName: string): number {
    const ranked = rankFoodsByQuery(query, [
      { Codigo: "_", Nombre: foodName },
    ]);
    return ranked[0]?.score ?? 0;
  }

  private rank(query: string, foods: Food[]): FoodSearchHit[] {
    return rankFoodsByQuery(query, foods).map((hit: FoodRankHit<Food>) => ({
      food: hit.item,
      score: hit.score,
      reason: hit.reason,
    }));
  }
}
