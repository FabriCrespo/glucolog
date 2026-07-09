"use client";

import type { Dispatch } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GlucoseFormAction } from "@/reducers/glucoseFormReducer";
import type { DashboardFormFeedback, GlucoseFormSnapshot } from "@/types/dashboard-glucose";

interface GlucoseFormProps {
  form: GlucoseFormSnapshot;
  dispatch: Dispatch<GlucoseFormAction>;
  submitting: boolean;
  feedback: DashboardFormFeedback | null;
  fetchError?: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
}

const inputClass = "dash-input";
const labelClass = "dash-input-label";

const GlucoseForm = ({
  form,
  dispatch,
  submitting,
  feedback,
  fetchError,
  handleSubmit,
  onCancel,
}: GlucoseFormProps) => {
  const {
    glucoseLevel,
    measurementContext,
    ateSomething,
    foodEaten,
    foodMeal,
    minutesSinceMeal,
    medicationTakenRecently,
    medicationType,
    activityLevelLastHours,
    stressLevel,
    notes,
  } = form;

  return (
    <div className="relative border-y border-slate-200 bg-gradient-to-r from-emerald-500/[0.04] to-transparent py-6 pl-4 lg:py-8 lg:pl-5">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-vitality-primary" aria-hidden />

      <p className={labelClass}>Nueva lectura</p>
      <p className="dash-body mt-1">Completa los datos esenciales. El resto es opcional.</p>

      {fetchError ? (
        <p className="mt-4 text-sm font-light text-amber-700">{fetchError}</p>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelClass} htmlFor="glucoseLevel">
              Glucosa
            </label>
            <div className="mt-2 flex items-baseline gap-2">
              <input
                id="glucoseLevel"
                type="number"
                inputMode="numeric"
                className={`${inputClass} text-4xl font-extralight tabular-nums lg:text-5xl`}
                value={glucoseLevel}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    dispatch({
                      type: "SET_GLUCOSE_LEVEL",
                      payload: value === "" ? "" : Math.max(0, Number(value)),
                    });
                  }
                }}
                min="0"
                required
                placeholder="—"
              />
              <span className="shrink-0 pb-3 text-xs font-light text-slate-400">
                mg/dL
              </span>
            </div>
          </div>

          <div className="lg:col-span-4">
            <label className={labelClass} htmlFor="measurementContext">
              Contexto
            </label>
            <select
              id="measurementContext"
              className={`${inputClass} mt-2 cursor-pointer text-sm font-light`}
              value={measurementContext}
              onChange={(e) =>
                dispatch({
                  type: "SET_MEASUREMENT_CONTEXT",
                  payload: e.target.value as GlucoseFormSnapshot["measurementContext"],
                })
              }
            >
              <option value="fasting">Ayunas</option>
              <option value="pre_meal">Antes de comer</option>
              <option value="post_meal_1h">1h post comida</option>
              <option value="post_meal_2h">2h post comida</option>
              <option value="bedtime">Antes de dormir</option>
              <option value="random">Aleatoria</option>
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className={labelClass} htmlFor="activityLevel">
              Actividad reciente
            </label>
            <select
              id="activityLevel"
              className={`${inputClass} mt-2 cursor-pointer text-sm font-light`}
              value={activityLevelLastHours}
              onChange={(e) =>
                dispatch({
                  type: "SET_ACTIVITY_LEVEL_LAST_HOURS",
                  payload: e.target.value as GlucoseFormSnapshot["activityLevelLastHours"],
                })
              }
            >
              <option value="none">Ninguna</option>
              <option value="light">Ligera</option>
              <option value="moderate">Moderada</option>
              <option value="intense">Intensa</option>
            </select>
          </div>
        </div>

        <details className="group/details border-t border-slate-200/80 pt-4">
          <summary className="cursor-pointer list-none dash-stat-label transition-colors hover:text-vitality-primary [&::-webkit-details-marker]:hidden">
            + Detalles opcionales
          </summary>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-3 text-sm font-light text-slate-600 transition-colors hover:text-emerald-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-vitality-primary focus:ring-vitality-primary/30"
                checked={ateSomething}
                onChange={(e) =>
                  dispatch({ type: "SET_ATE_SOMETHING", payload: e.target.checked })
                }
              />
              Comió antes de medir
            </label>

            <label className="flex items-center gap-3 text-sm font-light text-slate-600 transition-colors hover:text-emerald-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-vitality-primary focus:ring-vitality-primary/30"
                checked={medicationTakenRecently}
                onChange={(e) =>
                  dispatch({
                    type: "SET_MEDICATION_TAKEN_RECENTLY",
                    payload: e.target.checked,
                  })
                }
              />
              Medicación reciente
            </label>

            <div>
              <label className={labelClass} htmlFor="stressLevel">
                Estrés (1–5)
              </label>
              <select
                id="stressLevel"
                className={`${inputClass} mt-2 text-sm font-light`}
                value={stressLevel}
                onChange={(e) =>
                  dispatch({
                    type: "SET_STRESS_LEVEL",
                    payload:
                      e.target.value === ""
                        ? ""
                        : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5),
                  })
                }
              >
                <option value="">—</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {ateSomething ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-3"
              >
                <div>
                  <label className={labelClass} htmlFor="foodMeal">
                    Tipo comida
                  </label>
                  <select
                    id="foodMeal"
                    className={`${inputClass} mt-2 text-sm font-light`}
                    value={foodMeal}
                    onChange={(e) =>
                      dispatch({ type: "SET_FOOD_MEAL", payload: e.target.value })
                    }
                    required={ateSomething}
                  >
                    <option value="">Seleccionar</option>
                    <option value="desayuno">Desayuno</option>
                    <option value="almuerzo">Almuerzo</option>
                    <option value="cena">Cena</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="minutesSinceMeal">
                    Minutos desde comida
                  </label>
                  <input
                    id="minutesSinceMeal"
                    type="number"
                    className={`${inputClass} mt-2 text-sm font-light`}
                    value={minutesSinceMeal}
                    min={0}
                    max={720}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        dispatch({
                          type: "SET_MINUTES_SINCE_MEAL",
                          payload: value === "" ? "" : Math.max(0, Number(value)),
                        });
                      }
                    }}
                    required={ateSomething}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={labelClass} htmlFor="foodEaten">
                    Alimento
                  </label>
                  <input
                    id="foodEaten"
                    type="text"
                    className={`${inputClass} mt-2 text-sm font-light`}
                    value={foodEaten}
                    onChange={(e) =>
                      dispatch({ type: "SET_FOOD_EATEN", payload: e.target.value })
                    }
                    required={ateSomething}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {medicationTakenRecently ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <label className={labelClass} htmlFor="medicationType">
                  Medicación
                </label>
                <input
                  id="medicationType"
                  type="text"
                  className={`${inputClass} mt-2 text-sm font-light`}
                  value={medicationType}
                  onChange={(e) =>
                    dispatch({ type: "SET_MEDICATION_TYPE", payload: e.target.value })
                  }
                  required={medicationTakenRecently}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-5">
            <label className={labelClass} htmlFor="notes">
              Notas
            </label>
            <textarea
              id="notes"
              className={`${inputClass} mt-2 min-h-[4rem] resize-none text-sm font-light`}
              value={notes}
              onChange={(e) => dispatch({ type: "SET_NOTES", payload: e.target.value })}
              maxLength={400}
              rows={2}
              placeholder="Opcional"
            />
          </div>
        </details>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-light text-slate-500 transition-colors duration-200 hover:text-red-600"
            >
              Cancelar
            </button>
          ) : (
            <span />
          )}

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              type="submit"
              disabled={submitting}
              className="dash-btn-outline-active px-8 py-3 disabled:opacity-40"
            >
              {submitting ? "Registrando…" : "Guardar lectura"}
            </button>
            {feedback ? (
              <p
                className={`text-center text-xs font-light sm:text-right ${
                  feedback.variant === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {feedback.message}
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GlucoseForm;
