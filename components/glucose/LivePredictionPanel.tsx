"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brain, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  requestPrediction,
  type PredictionPayload,
  type PredictionResult,
} from "@/lib/prediction/clientFallback";
import type { GlucoseFormSnapshot } from "@/types/dashboard-glucose";
import type { GlucoseRecord } from "@/types/glucose";

interface LivePredictionPanelProps {
  records: GlucoseRecord[];
  form: GlucoseFormSnapshot;
}

function toDateFromRecord(record: GlucoseRecord): Date {
  if (record.recordedAt) return record.recordedAt.toDate();
  return new Date(`${record.date}T${record.time}`);
}

export default function LivePredictionPanel({
  records,
  form,
}: LivePredictionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const lastAutoPredictedSignature = useRef<string | null>(null);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  const payload = useMemo<PredictionPayload>(() => {
    const now = latestRecord ? toDateFromRecord(latestRecord) : new Date();

    return {
      diabetes_type: "unknown" as const,
      age: 40,
      sex: "other" as const,
      measurement_context: latestRecord?.measurementContext ?? form.measurementContext,
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

  const handlePredict = useCallback(async () => {
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
    void handlePredict();
  }, [handlePredict, latestSignature]);

  const riskDrivers = useMemo(() => {
    if (!result) return [];
    const drivers: string[] = [];

    if (result.risk_flag_high) {
      if (
        payload.measurement_context === "post_meal_1h" ||
        payload.measurement_context === "post_meal_2h"
      ) {
        drivers.push("Contexto post comida reciente.");
      }
      if (payload.stress_level >= 4) {
        drivers.push("Estrés alto reportado.");
      }
      if (payload.activity_level_last_hours === "none") {
        drivers.push("Poca actividad física en últimas horas.");
      }
      if (!payload.medication_taken_recently) {
        drivers.push("No hay medicación reciente registrada.");
      }
      if (payload.minutes_since_meal >= 0 && payload.minutes_since_meal <= 90) {
        drivers.push("Ventana cercana a la comida (pico probable).");
      }
    } else if (result.risk_flag_low) {
      if (payload.measurement_context === "fasting") {
        drivers.push("Medición en ayunas.");
      }
      if (payload.activity_level_last_hours === "intense") {
        drivers.push("Actividad intensa reciente.");
      }
      if (payload.medication_taken_recently) {
        drivers.push("Medicación reciente puede bajar niveles.");
      }
    } else {
      drivers.push("Contexto general estable para este momento del día.");
      if (payload.activity_level_last_hours !== "none") {
        drivers.push("Actividad reciente aporta control glucémico.");
      }
      if (payload.stress_level <= 3) {
        drivers.push("Estrés bajo-moderado.");
      }
    }

    return drivers.slice(0, 3);
  }, [payload, result]);

  const riskTone = result?.risk_flag_high
    ? "text-red-700 bg-red-50 border-red-200"
    : result?.risk_flag_low
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <section className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-vitality-primary">
            <Brain className="h-4 w-4" />
            Predicción en vivo
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Estimación automática de riesgo
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Usa el último contexto de tus registros para estimar glucosa y riesgo.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePredict}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-vitality-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vitality-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Prediciendo...
            </>
          ) : (
            "Predecir ahora"
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className={`mt-4 rounded-xl border px-4 py-4 ${riskTone}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Predicción estimada</p>
            {result.risk_flag_high || result.risk_flag_low ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {result.predicted_glucose_mg_dl} mg/dL
          </p>
          <p className="mt-1 text-sm">
            {result.risk_flag_high
              ? "Riesgo alto detectado."
              : result.risk_flag_low
              ? "Riesgo de nivel bajo detectado."
              : "Riesgo bajo, dentro de rango esperado."}
            {result.source === "client-fallback" ? " (modo estimación en cliente)" : null}
          </p>
          {riskDrivers.length ? (
            <div className="mt-3 rounded-lg border border-current/20 bg-white/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Factores que empujan el resultado
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {riskDrivers.map((driver) => (
                  <li key={driver}>• {driver}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
