import type {
  FoodItem,
  GlycemicLoadInfo,
  MicronutrientStatus,
  NutrientDensity,
  NutritionalRecommendation,
} from "@/types/food";
import {
  FOOD_SEARCH_SCORES,
  rankFoodsByQuery,
  type FoodMatchReason,
} from "@/lib/food/smartFoodSearch";

export function filterFoodBankItems(
  items: FoodItem[],
  searchTerm: string,
  onlyWithGlycemicIndex: boolean
): FoodItem[] {
  const q = searchTerm.trim();
  const withGi = onlyWithGlycemicIndex
    ? items.filter((item) => item.IndiceGlucemico != null)
    : items;

  if (!q) {
    return withGi;
  }

  const ranked = rankFoodsByQuery(q, withGi).filter(
    (hit) => hit.score >= FOOD_SEARCH_SCORES.levenshtein
  );

  return ranked.map((hit) => hit.item);
}

/** Mejor coincidencia + metadatos para la UI / panel IA. */
export function getFoodSearchInsight(
  items: FoodItem[],
  searchTerm: string
): {
  best: FoodItem | null;
  score: number;
  reason: FoodMatchReason | null;
  alternatives: FoodItem[];
} | null {
  const q = searchTerm.trim();
  if (!q) return null;

  const ranked = rankFoodsByQuery(q, items).filter(
    (hit) => hit.score >= FOOD_SEARCH_SCORES.levenshtein
  );
  if (!ranked.length) {
    return { best: null, score: 0, reason: null, alternatives: [] };
  }

  return {
    best: ranked[0].item,
    score: ranked[0].score,
    reason: ranked[0].reason,
    alternatives: ranked.slice(1, 4).map((h) => h.item),
  };
}

export function computeGlycemicLoad(
  food: FoodItem | null,
  portionSizeGrams: number
): GlycemicLoadInfo | null {
  if (
    !food?.IndiceGlucemico ||
    food.GramHCO == null ||
    portionSizeGrams <= 0
  ) {
    return null;
  }

  const value =
    (food.IndiceGlucemico * (food.GramHCO / 100) * portionSizeGrams) / 100;

  const category: GlycemicLoadInfo["category"] =
    value <= 10 ? "Baja" : value <= 19 ? "Media" : "Alta";

  return { value, category };
}

export function calculateMicronutrientStatus(food: FoodItem): MicronutrientStatus {
  const status = (value: number, low: number, high: number) => {
    if (value < low) return "low" as const;
    if (value > high) return "high" as const;
    return "good" as const;
  };

  return {
    magnesium: {
      value: food.Magnesio,
      status: status(food.Magnesio, 30, 400),
    },
    zinc: {
      value: food.Zinc,
      status: status(food.Zinc, 2, 15),
    },
    calcium: {
      value: food.Calcio,
      status: status(food.Calcio, 100, 1000),
    },
    potassium: {
      value: food.Potasio,
      status: status(food.Potasio, 300, 3500),
    },
  };
}

export function calculateNutrientDensity(food: FoodItem): NutrientDensity {
  const caloriesPer100g = food.Calorias;
  if (!caloriesPer100g || caloriesPer100g <= 0) {
    return {
      caloriesPer100g: 0,
      proteinDensity: 0,
      fiberDensity: 0,
      mineralDensity: 0,
      vitaminDensity: 0,
    };
  }

  const proteinDensity = ((food.Proteina * 4) / caloriesPer100g) * 100;
  const fiberDensity = ((food.Fibra * 2) / caloriesPer100g) * 100;
  const mineralDensity =
    (food.Magnesio / 400 + food.Zinc / 15 + food.Calcio / 1000 + food.Potasio / 3500) *
    100;
  const vitaminDensity =
    (food.VitaminaB6 / 2 + food.VitaminaB12 / 6 + food.AcidoFolico / 400) * 100;

  return {
    caloriesPer100g,
    proteinDensity,
    fiberDensity,
    mineralDensity,
    vitaminDensity,
  };
}

export function generateNutritionalRecommendations(
  food: FoodItem
): NutritionalRecommendation[] {
  const out: NutritionalRecommendation[] = [];

  if (food.Proteina < 5) {
    out.push({
      type: "complement",
      message:
        "Para complementar el bajo contenido proteico, combina con alimentos ricos en proteínas como huevos, pescado o legumbres.",
    });
  }

  if (food.IndiceGlucemico != null && food.IndiceGlucemico > 70) {
    out.push({
      type: "caution",
      message:
        "Al tener un índice glucémico alto, combina con fibra o proteínas para ralentizar la absorción de azúcar. Ideal con verduras o proteínas magras.",
    });
  }

  if (food.Calcio < 100) {
    out.push({
      type: "complement",
      message:
        "Para mejorar la absorción de nutrientes, combina con alimentos ricos en calcio como productos lácteos o verduras de hoja verde.",
    });
  }

  if (food.Fibra > 5) {
    out.push({
      type: "tip",
      message:
        "Rico en fibra. Para aprovechar mejor sus beneficios, asegúrate de mantener una buena hidratación.",
    });
  }

  return out;
}
