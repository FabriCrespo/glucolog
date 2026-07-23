import type { Food } from "../models/Food";

/**
 * Valores sentinel frecuentes en la tabla boliviana / exports.
 * Solo para el agente (DTO limpio al LLM).
 */
const NUMERIC_SENTINELS = new Set([2024, 9999, -1, -999, 99999]);

/**
 * Convierte registros crudos de RTDB → Food tipado.
 */
export class FoodMapper {
  static fromRtdb(
    codigo: string,
    raw: Record<string, unknown> | null | undefined
  ): Food | null {
    if (!raw || typeof raw !== "object") return null;

    const nombre = this.toTrimmedString(raw.Nombre);
    if (!nombre) return null;

    return {
      Codigo: this.toTrimmedString(codigo) || codigo,
      Nombre: nombre,
      Categoria: this.toTrimmedString(raw["Categoría"] ?? raw.Categoria) ?? "",
      Calorias: this.toNullableNumber(raw.Calorias),
      Proteina: this.toNullableNumber(raw["Proteina (g)"] ?? raw.Proteina),
      Grasa: this.toNullableNumber(raw["Grasa Total (g)"] ?? raw.Grasa),
      Carbohidratos: this.toNullableNumber(
        raw["Carbohidratos (g)"] ?? raw.Carbohidratos
      ),
      Fibra: this.toNullableNumber(raw["Fibra Dietética (g)"] ?? raw.Fibra),
      IndiceGlucemico: this.toNullableNumber(raw.IndiceGlucemico),
      GramHCO: this.toNullableNumber(raw.GramHCO),
    };
  }

  static fromRtdbMany(
    data: Record<string, Record<string, unknown>>
  ): Food[] {
    const foods: Food[] = [];
    for (const [codigo, raw] of Object.entries(data)) {
      const food = this.fromRtdb(codigo, raw);
      if (food) foods.push(food);
    }
    return foods;
  }

  static toPublicNutrition(food: Food) {
    return {
      id: food.Codigo,
      name: food.Nombre,
      category: food.Categoria || null,
      per100g: {
        calories: food.Calorias,
        protein: food.Proteina,
        fat: food.Grasa,
        carbohydrates: food.Carbohidratos,
        fiber: food.Fibra,
      },
      glycemicIndex: food.IndiceGlucemico,
      availableCarbsReference: food.GramHCO,
    };
  }

  static toSuggestion(food: Food, score: number, reason: string) {
    return {
      id: food.Codigo,
      name: food.Nombre,
      category: food.Categoria || null,
      score,
      matchReason: reason,
    };
  }

  private static toTrimmedString(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  private static toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;

    const n =
      typeof value === "number"
        ? value
        : parseFloat(String(value).replace(",", "."));

    if (!Number.isFinite(n)) return null;
    if (NUMERIC_SENTINELS.has(n)) return null;

    return n;
  }
}
