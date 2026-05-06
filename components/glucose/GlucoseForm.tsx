import type { Dispatch } from "react";
import { motion } from "framer-motion";
import { Coffee, Droplets, PlusCircle, UtensilsCrossed } from "lucide-react";
import type { GlucoseFormAction } from "@/reducers/glucoseFormReducer";
import type { DashboardFormFeedback, GlucoseFormSnapshot } from "@/types/dashboard-glucose";

interface GlucoseFormProps {
  form: GlucoseFormSnapshot;
  dispatch: Dispatch<GlucoseFormAction>;
  submitting: boolean;
  feedback: DashboardFormFeedback | null;
  fetchError?: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDateRangeChange: (value: string) => void;
}

const GlucoseForm = ({
  form,
  dispatch,
  submitting,
  feedback,
  fetchError,
  handleSubmit,
  handleDateRangeChange,
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
    dateRange,
  } = form;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="flex h-auto w-full shrink-0 flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/40 p-6 shadow-sm xl:max-w-[380px]"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-b from-emerald-50 to-emerald-50/50 shadow-[0_4px_14px_-4px_rgba(15,118,110,0.15)] ring-1 ring-emerald-100/80">
          <PlusCircle className="h-6 w-6 text-vitality-primary" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Nueva lectura
          </h2>
          <p className="text-xs text-slate-500">mg/dL</p>
        </div>
      </div>

      {fetchError ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {fetchError}
        </p>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <p className="text-sm leading-relaxed text-slate-600">
          Introduce tu nivel de glucosa en miligramos por decilitro (mg/dL).
        </p>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nivel de glucosa
          </label>
          <div className="relative mt-1 rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Droplets className="h-4 w-4 text-vitality-primary/80" strokeWidth={1.75} aria-hidden />
            </div>
            <input
              type="number"
              className="block w-full rounded-lg border border-slate-200 py-3 pl-10 pr-14 text-slate-900 transition-all placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
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
              placeholder="Ingrese nivel de glucosa"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-xs font-medium text-slate-500">mg/dL</span>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Contexto de medición
          </label>
          <select
            className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
            value={measurementContext}
            onChange={(e) =>
              dispatch({
                type: "SET_MEASUREMENT_CONTEXT",
                payload: e.target.value as
                  | "fasting"
                  | "pre_meal"
                  | "post_meal_1h"
                  | "post_meal_2h"
                  | "bedtime"
                  | "random",
              })
            }
          >
            <option value="fasting">Ayunas</option>
            <option value="pre_meal">Antes de comer</option>
            <option value="post_meal_1h">1h después de comer</option>
            <option value="post_meal_2h">2h después de comer</option>
            <option value="bedtime">Antes de dormir</option>
            <option value="random">Aleatoria</option>
          </select>
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <input
            type="checkbox"
            id="ateSomething"
            className="h-5 w-5 rounded border-slate-300 text-vitality-primary focus:ring-vitality-primary/30"
            checked={ateSomething}
            onChange={(e) => {
              dispatch({ type: "SET_ATE_SOMETHING", payload: e.target.checked });
            }}
          />
          <label htmlFor="ateSomething" className="ml-3 block text-sm font-medium text-slate-700">
            ¿Comió algo antes de la medición?
          </label>
        </div>

        {ateSomething && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo de comida
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UtensilsCrossed className="h-5 w-5 text-slate-400" strokeWidth={1.75} aria-hidden />
                </div>
                <select
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                  value={foodMeal}
                  onChange={(e) =>
                    dispatch({ type: "SET_FOOD_MEAL", payload: e.target.value })
                  }
                  required={ateSomething}
                >
                  <option value="">Seleccione tipo de comida</option>
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Minutos desde la comida
              </label>
              <input
                type="number"
                className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
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
                placeholder="Ej: 45"
                required={ateSomething}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Alimento comido
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Coffee className="h-5 w-5 text-slate-400" strokeWidth={1.75} aria-hidden />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                  value={foodEaten}
                  onChange={(e) =>
                    dispatch({ type: "SET_FOOD_EATEN", payload: e.target.value })
                  }
                  placeholder="¿Qué comió?"
                  required={ateSomething}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="medicationTakenRecently"
              className="h-5 w-5 rounded border-slate-300 text-vitality-primary focus:ring-vitality-primary/30"
              checked={medicationTakenRecently}
              onChange={(e) =>
                dispatch({
                  type: "SET_MEDICATION_TAKEN_RECENTLY",
                  payload: e.target.checked,
                })
              }
            />
            <label
              htmlFor="medicationTakenRecently"
              className="ml-3 block text-sm font-medium text-slate-700"
            >
              ¿Tomaste medicación recientemente?
            </label>
          </div>

          {medicationTakenRecently && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo de medicación
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                value={medicationType}
                onChange={(e) =>
                  dispatch({ type: "SET_MEDICATION_TYPE", payload: e.target.value })
                }
                placeholder="Ej: Metformina / Insulina rápida"
                required={medicationTakenRecently}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Actividad física últimas horas
          </label>
          <select
            className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
            value={activityLevelLastHours}
            onChange={(e) =>
              dispatch({
                type: "SET_ACTIVITY_LEVEL_LAST_HOURS",
                payload: e.target.value as "none" | "light" | "moderate" | "intense",
              })
            }
          >
            <option value="none">Ninguna</option>
            <option value="light">Ligera</option>
            <option value="moderate">Moderada</option>
            <option value="intense">Intensa</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nivel de estrés (1 a 5)
          </label>
          <select
            className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
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
            <option value="">Sin indicar</option>
            <option value={1}>1 - Muy bajo</option>
            <option value={2}>2 - Bajo</option>
            <option value={3}>3 - Medio</option>
            <option value={4}>4 - Alto</option>
            <option value={5}>5 - Muy alto</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Notas clínicas (opcional)
          </label>
          <textarea
            className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
            value={notes}
            onChange={(e) => dispatch({ type: "SET_NOTES", payload: e.target.value })}
            maxLength={400}
            rows={3}
            placeholder="Síntomas, calidad del sueño, situación especial, etc."
          />
        </div>

        <button
          className="flex h-11 w-full items-center justify-center rounded-full border border-vitality-primary bg-vitality-primary text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-vitality-primary-dark disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Registrando...
            </>
          ) : (
            "Registrar lectura"
          )}
        </button>

        <div className="mt-2">
          <label className="mb-1.5 block text-center text-xs font-medium uppercase tracking-wide text-slate-500">
            Rango del historial
          </label>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white text-center text-sm font-medium text-slate-800 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/20"
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="7 días">Últimos 7 días</option>
            <option value="1 mes">Último mes</option>
            <option value="3 meses">Últimos 3 meses</option>
            <option value="1 año">Último año</option>
          </select>
        </div>

        {feedback ? (
          <p
            className={`mt-2 text-center text-sm font-medium ${
              feedback.variant === "success" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </form>
    </motion.div>
  );
};

export default GlucoseForm;
