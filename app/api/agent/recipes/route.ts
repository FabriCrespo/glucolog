import { NextRequest, NextResponse } from "next/server";
import { RecipeSuggestionService } from "@/agent/services/RecipeSuggestionService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const food = body?.food;
    if (!food || typeof food.Nombre !== "string" || !food.Nombre.trim()) {
      return NextResponse.json(
        { error: "food.Nombre is required" },
        { status: 400 }
      );
    }

    const service = new RecipeSuggestionService();
    const result = await service.suggest({
      food: {
        Nombre: String(food.Nombre),
        Categoria: String(food.Categoria ?? ""),
        Calorias: Number(food.Calorias) || 0,
        Proteina: Number(food.Proteina) || 0,
        Carbohidratos: Number(food.Carbohidratos) || 0,
        Fibra: Number(food.Fibra) || 0,
        CarbohidratosNetos: Number(food.CarbohidratosNetos) || 0,
        IndiceGlucemico:
          food.IndiceGlucemico == null ? undefined : Number(food.IndiceGlucemico),
      },
      user: {
        diabetesType:
          typeof body?.user?.diabetesType === "string"
            ? body.user.diabetesType
            : undefined,
        age: typeof body?.user?.age === "number" ? body.user.age : undefined,
        weight:
          typeof body?.user?.weight === "number" ? body.user.weight : undefined,
        height:
          typeof body?.user?.height === "number" ? body.user.height : undefined,
        gender:
          typeof body?.user?.gender === "string" ? body.user.gender : undefined,
        firstName:
          typeof body?.user?.firstName === "string"
            ? body.user.firstName
            : undefined,
      },
      glucose: {
        level:
          typeof body?.glucose?.level === "number" ? body.glucose.level : null,
        statusLabel:
          typeof body?.glucose?.statusLabel === "string"
            ? body.glucose.statusLabel
            : "Sin dato",
        measuredAt:
          typeof body?.glucose?.measuredAt === "string"
            ? body.glucose.measuredAt
            : null,
        context:
          typeof body?.glucose?.context === "string"
            ? body.glucose.context
            : null,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unexpected recipe error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
