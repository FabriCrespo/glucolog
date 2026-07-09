"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  requestPrediction,
  type PredictionPayload,
  type PredictionResult,
} from "@/lib/prediction/clientFallback";
import {
  getPredictionCoachMessage,
  getPredictionRiskMeta,
  getRiskScore,
} from "@/lib/dashboard/metrics";
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
        drivers.push("Post comida");
      }
      if (payload.stress_level >= 4) drivers.push("Estrés alto");
      if (payload.activity_level_last_hours === "none") drivers.push("Poca actividad");
      if (!payload.medication_taken_recently) drivers.push("Sin medicación reciente");
    } else if (result.risk_flag_low) {
      if (payload.measurement_context === "fasting") drivers.push("En ayunas");
      if (payload.medication_taken_recently) drivers.push("Medicación activa");
    } else {
      drivers.push("Contexto estable");
      if (payload.activity_level_last_hours !== "none") drivers.push("Actividad reciente");
    }

    return drivers.slice(0, 3);
  }, [payload, result]);

  const riskMeta = result ? getPredictionRiskMeta(result) : null;
  const riskScore = result ? getRiskScore(result) : 0;
  const delta =
    result && latestRecord
      ? result.predicted_glucose_mg_dl - latestRecord.glucoseLevel
      : null;

  return (
    <section
      aria-label="Predicción en vivo"
      className="border-t border-slate-200 pt-10 lg:pt-14"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 dash-eyebrow">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-vitality-primary" : "bg-emerald-500"}`}
              aria-hidden
            />
            Predicción en vivo
          </p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Próxima lectura estimada
          </h2>
        </div>

        <button
          type="button"
          onClick={handlePredict}
          disabled={loading || !latestRecord}
          className="dash-btn-ghost"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Analizando
            </span>
          ) : (
            "Actualizar"
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-6 text-sm font-light text-red-600">{error}</p>
      ) : null}

      {!latestRecord && !loading ? (
        <p className="mt-8 dash-body text-slate-500">
          Registra una lectura para activar la predicción automática.
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {loading && !result ? (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 text-sm font-light text-slate-400"
          >
            Leyendo tu contexto…
          </motion.p>
        ) : null}

        {result && riskMeta ? (
          <motion.div
            key={`${result.predicted_glucose_mg_dl}-${result.risk_flag_high}-${result.risk_flag_low}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`relative mt-8 overflow-hidden border-y border-slate-200 bg-gradient-to-r ${riskMeta.glow} py-8 pl-4 lg:mt-10 lg:py-10 lg:pl-5`}
          >
            <div className={`absolute inset-y-0 left-0 w-0.5 ${riskMeta.bar}`} aria-hidden />

            <p className={`text-[10px] font-medium uppercase tracking-[0.22em] ${riskMeta.text}`}>
              {riskMeta.label}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:mt-8 lg:grid-cols-12 lg:items-end lg:gap-0 lg:divide-x lg:divide-slate-200/80">
              {latestRecord ? (
                <dl className="group lg:col-span-2 lg:pr-8">
                  <dt className="dash-stat-label">Actual</dt>
                  <dd className="mt-1 text-3xl font-extralight tabular-nums text-slate-500 transition-colors duration-300 group-hover:text-slate-700 lg:text-4xl">
                    {latestRecord.glucoseLevel}
                  </dd>
                  <dd className="dash-muted">mg/dL</dd>
                </dl>
              ) : null}

              {latestRecord ? (
                <div className="col-span-2 hidden items-center justify-center lg:col-span-1 lg:flex">
                  <ArrowRight
                    className="h-5 w-5 text-emerald-300/80 transition-colors duration-300"
                    strokeWidth={1}
                    aria-hidden
                  />
                </div>
              ) : null}

              <dl className="group lg:col-span-3 lg:px-8">
                <dt className="dash-stat-label">Estimado</dt>
                <dd
                  className={`mt-1 text-5xl font-extralight tabular-nums leading-none lg:text-6xl xl:text-7xl ${riskMeta.text}`}
                >
                  {result.predicted_glucose_mg_dl}
                </dd>
                <dd className="dash-muted mt-1">mg/dL</dd>
              </dl>

              {delta != null ? (
                <dl className="group lg:col-span-2 lg:px-8">
                  <dt className="dash-stat-label">Cambio</dt>
                  <dd className={`mt-1 text-3xl font-extralight tabular-nums lg:text-4xl ${riskMeta.text}`}>
                    {delta === 0 ? "0" : delta > 0 ? `+${delta}` : delta}
                  </dd>
                  <dd className="dash-muted">mg/dL</dd>
                </dl>
              ) : null}

              <dl className="group col-span-2 sm:col-span-4 lg:col-span-4 lg:pl-8">
                <dt className="dash-stat-label">Nivel de riesgo</dt>
                <dd className="mt-3">
                  <div className="h-px w-full bg-slate-200" aria-hidden />
                  <motion.div
                    className={`-mt-px h-0.5 ${riskMeta.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${riskScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </dd>
                <dd className={`mt-2 text-sm font-light tabular-nums lg:text-base ${riskMeta.text}`}>
                  {riskScore}%
                </dd>
              </dl>
            </div>

            <div className="mt-8 grid gap-6 border-t border-slate-200/80 pt-8 lg:mt-10 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-16 lg:pt-10">
              <p className="dash-accent-quote text-sm lg:text-[15px]">
                {getPredictionCoachMessage(result)}
              </p>

              <div className="lg:text-right">
                {riskDrivers.length ? (
                  <p className="text-xs font-light tracking-wide text-slate-500 lg:text-sm">
                    {riskDrivers.join("  ·  ")}
                  </p>
                ) : null}
                {result.source === "client-fallback" ? (
                  <p className="mt-3 text-[10px] font-light uppercase tracking-[0.18em] text-slate-300">
                    Modo estimación local
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
