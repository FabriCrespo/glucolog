"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FoodItem, FoodRecipeSuggestionsResult } from "@/types/food";
import { getUserData } from "@/services/userService";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import { getGlucoseStatus } from "@/lib/dashboard/metrics";

const CONTEXT_LABEL: Record<string, string> = {
  fasting: "en ayunas",
  pre_meal: "antes de comer",
  post_meal_1h: "1 h después de comer",
  post_meal_2h: "2 h después de comer",
  bedtime: "antes de dormir",
  random: "al azar",
};

export type UseFoodRecipeSuggestionsResult = {
  loading: boolean;
  error: string | null;
  result: FoodRecipeSuggestionsResult | null;
  refresh: () => void;
};

/**
 * Pide a la IA recetas para el alimento seleccionado,
 * usando glucosa reciente + perfil del usuario.
 */
export function useFoodRecipeSuggestions(
  userId: string | undefined,
  food: FoodItem | null,
  enabled = true
): UseFoodRecipeSuggestionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodRecipeSuggestionsResult | null>(
    null
  );
  const [tick, setTick] = useState(0);
  const inFlight = useRef<string | null>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled || !userId || !food) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const key = `${userId}:${food.Codigo}:${tick}`;
    if (inFlight.current === key) return;
    inFlight.current = key;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [profile, records] = await Promise.all([
          getUserData(userId),
          fetchGlucoseRecords(userId, 7),
        ]);

        const latest = records[0] ?? null;
        const status = latest
          ? getGlucoseStatus(latest.glucoseLevel)
          : { status: "normal" as const, label: "Sin lectura reciente" };

        const res = await fetch("/api/agent/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            food: {
              Nombre: food.Nombre,
              Categoria: food.Categoria,
              Calorias: food.Calorias,
              Proteina: food.Proteina,
              Carbohidratos: food.Carbohidratos,
              Fibra: food.Fibra,
              CarbohidratosNetos: food.CarbohidratosNetos,
              IndiceGlucemico: food.IndiceGlucemico,
            },
            user: {
              firstName: profile?.firstName,
              diabetesType: profile?.diabetesType,
              age: profile?.age,
              weight: profile?.weight,
              height: profile?.height,
              gender: profile?.gender,
            },
            glucose: {
              level: latest?.glucoseLevel ?? null,
              statusLabel: status.label,
              measuredAt: latest
                ? `${latest.date} ${latest.time}`.trim()
                : null,
              context: latest
                ? CONTEXT_LABEL[latest.measurementContext] ??
                  latest.measurementContext
                : null,
            },
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            data.error ||
              "No se pudieron generar recetas. ¿Está corriendo npm run dev?"
          );
        }

        const data = (await res.json()) as FoodRecipeSuggestionsResult;
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setResult(null);
          setError(err instanceof Error ? err.message : "Error al generar recetas");
        }
      } finally {
        if (inFlight.current === key) inFlight.current = null;
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, userId, food, tick]);

  return { loading, error, result, refresh };
}
