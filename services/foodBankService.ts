import { get, ref } from "firebase/database";
import { database } from "@/app/firebase/config";
import { FOOD_BANK_RTDB_PATH } from "@/constants/foodBank";
import type { FoodItem } from "@/types/food";

function mapRawFoodRecord(key: string, raw: Record<string, unknown>): FoodItem {
  return {
    Codigo: key,
    Nombre: String(raw.Nombre ?? ""),
    Agua: parseFloat(String(raw["Agua (%)"])) || 0,
    Calorias: parseFloat(String(raw.Calorias)) || 0,
    Proteina: parseFloat(String(raw["Proteina (g)"])) || 0,
    Grasa: parseFloat(String(raw["Grasa Total (g)"])) || 0,
    Carbohidratos: parseFloat(String(raw["Carbohidratos (g)"])) || 0,
    Fibra: parseFloat(String(raw["Fibra Dietética (g)"])) || 0,
    Calcio: parseFloat(String(raw["Calcio (mg)"])) || 0,
    Potasio: parseFloat(String(raw["Potasio (mg)"])) || 0,
    Zinc: parseFloat(String(raw["Zinc (mg)"])) || 0,
    Magnesio: parseFloat(String(raw["Magnesio (mg)"])) || 0,
    VitaminaB6: parseFloat(String(raw["Vitamina B6 (mg)"])) || 0,
    VitaminaB12: parseFloat(String(raw["Vitamina B12 (mcg)"])) || 0,
    AcidoFolico: parseFloat(String(raw["Acido Folico (mcg)"])) || 0,
    FolatoEquivFD: parseFloat(String(raw["Folato Equiv. FD"])) || 0,
    FraccionComestible: parseFloat(String(raw["Fraccion Comestible (%)"])) || 0,
    Categoria: String(raw["Categoría"] ?? ""),
    CarbohidratosNetos: parseFloat(String(raw["Carbohidratos Netos"])) || 0,
    ClasificacionCarbohidratos: String(
      raw["Clasificación Carbohidratos"] ?? ""
    ),
    IndiceGlucemico:
      raw.IndiceGlucemico === null || raw.IndiceGlucemico === undefined
        ? undefined
        : Number(raw.IndiceGlucemico),
    GramHCO:
      raw.GramHCO === null || raw.GramHCO === undefined
        ? undefined
        : Number(raw.GramHCO),
  };
}

/**
 * Carga todos los ítems de la tabla de alimentos desde Realtime Database.
 */
export async function fetchFoodBankItems(): Promise<FoodItem[]> {
  const snapshot = await get(ref(database, FOOD_BANK_RTDB_PATH));

  if (!snapshot.exists()) {
    throw new Error("No se encontraron datos de alimentos");
  }

  const data = snapshot.val() as Record<string, Record<string, unknown>>;
  return Object.keys(data).map((key) => mapRawFoodRecord(key, data[key]));
}
