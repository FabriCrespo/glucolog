"use client";

import { useMemo } from "react";
import { Utensils, Clock, Activity } from "lucide-react";
import type { GlucoseRecord } from "@/types/glucose";
import type { PredictionResult } from "@/lib/prediction/clientFallback";
import {
  buildPostMealCoachGuidance,
  formatNextMealWindow,
} from "@/lib/dashboard/postMealCoach";

interface PostMealCoachPanelProps {
  records: GlucoseRecord[];
  prediction: PredictionResult | null;
  predictionLoading?: boolean;
  embedded?: boolean;
}

const impactTone: Record<string, string> = {
  alto: "border-rose-200 bg-rose-50/40 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-200",
  moderado:
    "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200",
  bajo: "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200",
  leve: "border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200",
};

export default function PostMealCoachPanel({
  records,
  prediction,
  predictionLoading = false,
  embedded = false,
}: PostMealCoachPanelProps) {
  const guidance = useMemo(
    () => buildPostMealCoachGuidance(records, prediction),
    [records, prediction]
  );

  const windowText = formatNextMealWindow(
    guidance.nextMealHours,
    guidance.minutesSinceMeal
  );

  return (
    <section
      aria-label="Guía post-comida"
      className={embedded ? "" : "border-t border-slate-200 pt-10 lg:pt-14"}
    >
      {embedded ? null : (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="dash-eyebrow">Después de comer</p>
              <h2 className="dash-title mt-2 text-xl lg:text-2xl">
                Estimado de tu última comida
              </h2>
            </div>
            {predictionLoading ? (
              <span className="text-xs font-light text-slate-400">
                Actualizando predicción…
              </span>
            ) : null}
          </div>

          <p className="dash-body mt-3 max-w-2xl">
            Combina lo último que registraste como comida con la predicción de
            glucosa para estimar el impacto y cuándo volver a comer o medir.
          </p>
        </>
      )}

      {embedded && predictionLoading ? (
        <p className="mb-4 text-xs font-light text-slate-400">
          Actualizando predicción…
        </p>
      ) : null}

      {!guidance.hasMeal ? (
        <p className={`${embedded ? "mt-0" : "mt-8"} dash-body text-slate-500`}>
          {guidance.impactSummary}
        </p>
      ) : (
        <div className={`${embedded ? "mt-0" : "mt-8"} space-y-6`}>
          <div
            className={`rounded-2xl border px-4 py-4 lg:rounded-none ${
              guidance.impact
                ? impactTone[guidance.impact]
                : "border-slate-200 bg-slate-50/40"
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em]">
              {guidance.impactTitle}
            </p>
            <p className="mt-2 text-sm font-light leading-relaxed">
              {guidance.impactSummary}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-slate-100 px-4 py-3">
              <p className="dash-stat-label flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5" strokeWidth={1.5} />
                Comida
              </p>
              <p className="mt-1 text-base font-light text-slate-900 dark:text-emerald-50">
                {guidance.foodName}
              </p>
              <p className="dash-muted mt-0.5">
                {guidance.mealType ? `${guidance.mealType} · ` : null}
                {guidance.mealAtLabel}
              </p>
            </div>

            <div className="border border-slate-100 px-4 py-3">
              <p className="dash-stat-label flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />
                Glucosa
              </p>
              <p className="mt-1 text-base font-light tabular-nums text-slate-900 dark:text-emerald-50">
                {guidance.glucoseAtMeal != null
                  ? `${guidance.glucoseAtMeal} → ${
                      guidance.predictedGlucose ?? "—"
                    }`
                  : "—"}
                <span className="ml-1 text-sm text-slate-400">mg/dL</span>
              </p>
              <p className="dash-muted mt-0.5">
                {guidance.delta != null
                  ? `Cambio predicho ${
                      guidance.delta > 0 ? "+" : ""
                    }${guidance.delta}`
                  : "Sin predicción aún"}
              </p>
            </div>

            <div className="border border-slate-100 px-4 py-3">
              <p className="dash-stat-label flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                Próximo control
              </p>
              <p className="mt-1 text-base font-light text-slate-900 dark:text-emerald-50">
                {guidance.nextCheckLabel}
              </p>
              <p className="dash-muted mt-0.5">
                {guidance.minutesSinceMeal != null
                  ? `Han pasado ~${(guidance.minutesSinceMeal / 60).toFixed(1)} h desde la comida`
                  : null}
              </p>
            </div>
          </div>

          {guidance.nextMealAdvice ? (
            <div className="border-l-2 border-vitality-primary/70 pl-4">
              <p className="dash-stat-label">¿Cuándo volver a comer?</p>
              <p className="dash-body mt-2">{guidance.nextMealAdvice}</p>
              {windowText ? (
                <p className="mt-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {windowText}
                </p>
              ) : null}
            </div>
          ) : null}

          {guidance.tips.length ? (
            <ul className="space-y-2 border-t border-slate-200 pt-4">
              {guidance.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm font-light text-slate-600 dark:text-emerald-200/85"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="text-[10px] font-light uppercase tracking-[0.16em] text-slate-400">
            Orientación educativa · no sustituye consejo médico
          </p>
        </div>
      )}
    </section>
  );
}
