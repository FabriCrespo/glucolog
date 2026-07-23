import type { GlucoseRecord } from "@/types/glucose";
import { getGlucoseStatus, getInRangePercent, getTrend } from "@/lib/dashboard/metrics";

export type DailyFocus = {
  headline: string;
  detail: string;
  tag: string;
};

/**
 * Frase de “foco del día” al abrir el dashboard.
 */
export function buildDailyFocus(records: GlucoseRecord[]): DailyFocus {
  const latest = records[0] ?? null;
  const hour = new Date().getHours();
  const inRange = getInRangePercent(records);
  const trend = getTrend(records);

  if (!latest) {
    return {
      tag: "Hoy",
      headline: "Hoy tu foco es registrar tu primera lectura",
      detail:
        "Sin datos no hay predicción ni patrones. Anota glucosa y, si comiste, qué fue.",
    };
  }

  const { status } = getGlucoseStatus(latest.glucoseLevel);

  if (status === "low") {
    return {
      tag: "Prioridad",
      headline: "Hoy tu foco es estabilizar una posible baja",
      detail:
        "Revisa síntomas, ten una corrección rápida a mano y mide de nuevo en ~15–20 min.",
    };
  }

  if (status === "high" && trend.direction === "up") {
    return {
      tag: "Prioridad",
      headline: "Hoy tu foco es frenar la subida post-comida",
      detail:
        "Evita snacks extra, hidrátate y considera una caminata corta si tu plan lo permite.",
    };
  }

  if (status === "high") {
    return {
      tag: "Hoy",
      headline: "Hoy tu foco es controlar el post-comida",
      detail:
        "Mide 1–2 h después de comer y anota el plato: así afinamos predicción y patrones.",
    };
  }

  // Por franja horaria
  if (hour >= 5 && hour < 11) {
    return {
      tag: "Mañana",
      headline: "Hoy tu foco es un desayuno estable",
      detail:
        inRange >= 70
          ? "Vas bien en rango. Mantén porciones predecibles en el desayuno."
          : "Prioriza proteína + fibra en el desayuno y registra la glucosa de la mañana.",
    };
  }

  if (hour >= 11 && hour < 16) {
    return {
      tag: "Mediodía",
      headline: "Hoy tu foco es controlar el post-almuerzo",
      detail:
        "La ventana de la comida del mediodía suele marcar el pico del día. Anota qué comes y mide después.",
    };
  }

  if (hour >= 16 && hour < 21) {
    return {
      tag: "Tarde",
      headline: "Hoy tu foco es una cena con porción controlada",
      detail:
        trend.direction === "up"
          ? "La tendencia viene al alza: cena más ligera en carbohidratos si puedes."
          : "Mantén la cena equilibrada y evita picoteo nocturno azucarado.",
    };
  }

  return {
    tag: "Noche",
    headline: "Hoy tu foco es cerrar el día con una lectura clara",
    detail:
      "Una medición antes de dormir + qué cenaste ayuda al informe del médico y a la predicción de mañana.",
  };
}
