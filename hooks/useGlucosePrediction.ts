"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  requestPrediction,
  type PredictionPayload,
  type PredictionResult,
} from "@/lib/prediction/clientFallback";
import type { GlucoseFormSnapshot } from "@/types/dashboard-glucose";
import type { GlucoseRecord } from "@/types/glucose";

function toDateFromRecord(record: GlucoseRecord): Date {
  if (record.recordedAt) return record.recordedAt.toDate();
  return new Date(`${record.date}T${record.time}`);
}

export type UseGlucosePredictionResult = {
  loading: boolean;
  error: string | null;
  result: PredictionResult | null;
  payload: PredictionPayload;
  latestRecord: GlucoseRecord | null;
  refresh: () => Promise<void>;
};

/**
 * Predicción compartida (panel en vivo + coach post-comida).
 */
export function useGlucosePrediction(
  records: GlucoseRecord[],
  form: GlucoseFormSnapshot
): UseGlucosePredictionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const lastAutoPredictedSignature = useRef<string | null>(null);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  const payload = useMemo<PredictionPayload>(() => {
    const now = latestRecord ? toDateFromRecord(latestRecord) : new Date();

    return {
      diabetes_type: "unknown",
      age: 40,
      sex: "other",
      measurement_context:
        latestRecord?.measurementContext ?? form.measurementContext,
      ate_something: latestRecord?.ateSomething ?? form.ateSomething,
      food_meal:
        latestRecord?.foodMeal ??
        (form.foodMeal.trim() ? form.foodMeal.trim().toLowerCase() : "unknown"),
      minutes_since_meal:
        latestRecord?.minutesSinceMeal ??
        (typeof form.minutesSinceMeal === "number" ? form.minutesSinceMeal : -1),
      medication_taken_recently:
        latestRecord?.medicationTakenRecently ?? form.medicationTakenRecently,
      medication_type:
        latestRecord?.medicationType ??
        (form.medicationType.trim() ? form.medicationType.trim() : "unknown"),
      activity_level_last_hours:
        latestRecord?.activityLevelLastHours ?? form.activityLevelLastHours,
      stress_level:
        latestRecord?.stressLevel ??
        (typeof form.stressLevel === "number" ? form.stressLevel : 3),
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
    };
  }, [form, latestRecord]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestPrediction(payload, latestRecord?.glucoseLevel);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [latestRecord?.glucoseLevel, payload]);

  const latestSignature = useMemo(
    () =>
      latestRecord
        ? `${latestRecord.recordedAtIso}|${latestRecord.glucoseLevel}|${latestRecord.measurementContext}`
        : null,
    [latestRecord]
  );

  useEffect(() => {
    if (!latestSignature) return;
    if (lastAutoPredictedSignature.current === latestSignature) return;
    lastAutoPredictedSignature.current = latestSignature;
    void refresh();
  }, [latestSignature, refresh]);

  return {
    loading,
    error,
    result,
    payload,
    latestRecord,
    refresh,
  };
}
