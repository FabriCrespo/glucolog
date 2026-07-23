import type { Food } from "../models/Food";

/**
 * Contrato de acceso a datos de alimentos.
 * Solo carga; la búsqueda vive en FoodSearchService.
 */
export interface FoodRepository {
  getAll(): Promise<Food[]>;
}
