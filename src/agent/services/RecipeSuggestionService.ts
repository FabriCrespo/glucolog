import { GoogleGenAI } from "@google/genai";
import type {
  FoodItem,
  FoodRecipeSuggestion,
  FoodRecipeSuggestionsResult,
} from "@/types/food";

export type RecipeUserContext = {
  diabetesType?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  firstName?: string;
};

export type RecipeGlucoseContext = {
  level: number | null;
  statusLabel: string;
  measuredAt?: string | null;
  context?: string | null;
};

export type SuggestRecipesInput = {
  food: Pick<
    FoodItem,
    | "Nombre"
    | "Categoria"
    | "Calorias"
    | "Proteina"
    | "Carbohidratos"
    | "Fibra"
    | "IndiceGlucemico"
    | "CarbohidratosNetos"
  >;
  user: RecipeUserContext;
  glucose: RecipeGlucoseContext;
};

/**
 * Sugiere recetas educativas usando el alimento + glucosa + perfil.
 */
export class RecipeSuggestionService {
  private client: GoogleGenAI;
  private model: string;

  constructor(model?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = model ?? process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  }

  async suggest(input: SuggestRecipesInput): Promise<FoodRecipeSuggestionsResult> {
    const { food, user, glucose } = input;

    const prompt = `Eres el asistente nutricional educativo de GlucoLog (diabetes).
NO diagnostiques ni recetes medicamentos. Sé práctico, claro y en español.

Alimento principal a usar en las recetas:
- Nombre: ${food.Nombre}
- Categoría: ${food.Categoria || "n/d"}
- Por 100 g: ${food.Calorias} kcal, proteína ${food.Proteina} g, carbohidratos ${food.Carbohidratos} g (netos ${food.CarbohidratosNetos} g), fibra ${food.Fibra} g
- Índice glucémico: ${food.IndiceGlucemico ?? "no registrado"}

Estado del usuario:
- Nombre: ${user.firstName || "usuario"}
- Tipo de diabetes: ${user.diabetesType || "no indicado"}
- Edad: ${user.age ?? "n/d"}, sexo: ${user.gender || "n/d"}
- Peso: ${user.weight ?? "n/d"} kg, talla: ${user.height ?? "n/d"} cm

Glucosa reciente:
- Nivel: ${glucose.level != null ? `${glucose.level} mg/dL (${glucose.statusLabel})` : "sin lectura reciente"}
- Contexto de medición: ${glucose.context || "n/d"}
- Fecha/hora: ${glucose.measuredAt || "n/d"}

Tarea: propone 3 recetas caseras realistas que USEN este alimento como ingrediente central o importante.
Adapta porciones y acompañamientos al nivel de glucosa y al perfil:
- Si glucosa alta: prioriza fibra, proteína, porciones controladas, menos almidón libre.
- Si glucosa baja: incluye carbohidratos disponibles de forma segura y equilibrada (no solo azúcar).
- Si en rango o sin dato: opciones equilibradas y versátiles.

Devuelve ÚNICAMENTE JSON válido (sin markdown) con esta forma:
{
  "summary": "1-2 frases orientando al usuario",
  "glucoseContext": "cómo interpretas su glucosa/estado para estas recetas",
  "recipes": [
    {
      "title": "nombre corto",
      "why": "por qué encaja con su glucosa/estado",
      "servings": "ej. 1 plato",
      "prepMinutes": 20,
      "ingredients": ["…"],
      "steps": ["…"],
      "tips": ["…"],
      "glycemicNote": "nota breve de impacto glucémico"
    }
  ]
}`;

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    return this.parse(response.text?.trim() ?? "");
  }

  private parse(text: string): FoodRecipeSuggestionsResult {
    const fallback: FoodRecipeSuggestionsResult = {
      summary:
        "No pude generar recetas ahora. Prueba de nuevo en un momento.",
      glucoseContext: "",
      recipes: [],
    };

    try {
      const raw = JSON.parse(this.stripFences(text)) as Record<string, unknown>;
      const recipesRaw = Array.isArray(raw.recipes) ? raw.recipes : [];
      const recipes: FoodRecipeSuggestion[] = recipesRaw
        .slice(0, 3)
        .map((r) => this.mapRecipe(r))
        .filter((r) => r.title.length > 0);

      return {
        summary:
          typeof raw.summary === "string" && raw.summary.trim()
            ? raw.summary.trim()
            : fallback.summary,
        glucoseContext:
          typeof raw.glucoseContext === "string" ? raw.glucoseContext.trim() : "",
        recipes,
      };
    } catch {
      return fallback;
    }
  }

  private mapRecipe(raw: unknown): FoodRecipeSuggestion {
    if (!raw || typeof raw !== "object") {
      return {
        title: "",
        why: "",
        servings: "",
        prepMinutes: 0,
        ingredients: [],
        steps: [],
        tips: [],
        glycemicNote: "",
      };
    }
    const r = raw as Record<string, unknown>;
    return {
      title: String(r.title ?? "").trim(),
      why: String(r.why ?? "").trim(),
      servings: String(r.servings ?? "").trim(),
      prepMinutes: Number(r.prepMinutes) || 0,
      ingredients: this.stringList(r.ingredients),
      steps: this.stringList(r.steps),
      tips: this.stringList(r.tips),
      glycemicNote: String(r.glycemicNote ?? "").trim(),
    };
  }

  private stringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  private stripFences(text: string): string {
    const trimmed = text.trim();
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return match ? match[1].trim() : trimmed;
  }
}
