import { NextRequest, NextResponse } from "next/server";
import { FoodSearchService } from "@/agent/services/FoodSearchService";

const searchService = new FoodSearchService();

/**
 * Prueba independiente del buscador (sin Tool / Gemini).
 * GET /api/agent/food-search?q=platano
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) {
      return NextResponse.json(
        { error: "Query param q is required, e.g. ?q=platano" },
        { status: 400 }
      );
    }

    const ranked = await searchService.searchRanked(q, 5);
    const best = ranked[0] ?? null;
    const confidence =
      !best
        ? "low"
        : best.score >= 80
          ? "high"
          : best.score >= 60
            ? "medium"
            : "low";

    return NextResponse.json({
      query: q,
      normalized: searchService.normalize(q),
      confidence,
      best: best
        ? {
            score: best.score,
            reason: best.reason,
            food: {
              id: best.food.Codigo,
              name: best.food.Nombre,
              category: best.food.Categoria,
              calories: best.food.Calorias,
              carbohydrates: best.food.Carbohidratos,
              protein: best.food.Proteina,
              fat: best.food.Grasa,
              fiber: best.food.Fibra,
              glycemicIndex: best.food.IndiceGlucemico,
            },
          }
        : null,
      ranked: ranked.map((hit) => ({
        score: hit.score,
        reason: hit.reason,
        id: hit.food.Codigo,
        name: hit.food.Nombre,
        category: hit.food.Categoria,
      })),
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Food search failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
