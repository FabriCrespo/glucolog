export type PredictionPayload = {
  diabetes_type: "type1" | "type2" | "unknown";
  age: number;
  sex: "female" | "male" | "other";
  measurement_context:
    | "fasting"
    | "pre_meal"
    | "post_meal_1h"
    | "post_meal_2h"
    | "bedtime"
    | "random";
  ate_something: boolean;
  food_meal: string;
  minutes_since_meal: number;
  medication_taken_recently: boolean;
  medication_type: string;
  activity_level_last_hours: "none" | "light" | "moderate" | "intense";
  stress_level: number;
  hour_of_day: number;
  day_of_week: number;
};

export type PredictionResult = {
  predicted_glucose_mg_dl: number;
  risk_flag_high: boolean;
  risk_flag_low: boolean;
  source?: "remote-ml" | "api" | "client-fallback";
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** Heuristic fallback for static hosting (GitHub Pages) when no ML API is available. */
export function predictGlucoseClient(
  payload: PredictionPayload,
  latestGlucoseMgDl?: number
): PredictionResult {
  const contextAdjust: Record<PredictionPayload["measurement_context"], number> = {
    fasting: -18,
    pre_meal: -8,
    post_meal_1h: 28,
    post_meal_2h: 14,
    bedtime: 6,
    random: 0,
  };

  const activityAdjust: Record<PredictionPayload["activity_level_last_hours"], number> = {
    none: 10,
    light: 0,
    moderate: -8,
    intense: -16,
  };

  let value = latestGlucoseMgDl ?? 115;
  value += contextAdjust[payload.measurement_context];
  value += activityAdjust[payload.activity_level_last_hours];
  value += (payload.stress_level - 3) * 6;
  value += payload.medication_taken_recently ? -12 : 10;

  if (payload.ate_something && payload.minutes_since_meal >= 0 && payload.minutes_since_meal <= 90) {
    value += 8;
  }

  if (payload.diabetes_type === "type1") value += 6;
  if (payload.diabetes_type === "type2") value += 4;

  const predicted = clamp(value, 45, 420);

  return {
    predicted_glucose_mg_dl: predicted,
    risk_flag_high: predicted > 180,
    risk_flag_low: predicted < 70,
    source: "client-fallback",
  };
}

export async function requestPrediction(
  payload: PredictionPayload,
  latestGlucoseMgDl?: number
): Promise<PredictionResult> {
  const remoteUrl = process.env.NEXT_PUBLIC_PREDICTOR_URL?.trim();
  if (remoteUrl) {
    try {
      const response = await fetch(remoteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = (await response.json()) as PredictionResult;
        return { ...data, source: "remote-ml" };
      }
    } catch {
      // Continue to local API / fallback.
    }
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  try {
    const response = await fetch(`${basePath}/api/prediction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = (await response.json()) as PredictionResult;
      return { ...data, source: "api" };
    }
  } catch {
    // Static hosting (GitHub Pages) has no API routes.
  }

  return predictGlucoseClient(payload, latestGlucoseMgDl);
}
