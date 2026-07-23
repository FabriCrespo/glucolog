"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ChevronDown, RefreshCw, Sparkles } from "lucide-react";
import type { FoodItem, FoodRecipeSuggestionsResult } from "@/types/food";

interface FoodRecipeSuggestionsProps {
  food: FoodItem | null;
  loading: boolean;
  error: string | null;
  result: FoodRecipeSuggestionsResult | null;
  onRefresh?: () => void;
  className?: string;
}

export default function FoodRecipeSuggestions({
  food,
  loading,
  error,
  result,
  onRefresh,
  className = "",
}: FoodRecipeSuggestionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!food) return null;

  return (
    <motion.aside
      key={food.Codigo}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/40 px-4 py-5 shadow-sm shadow-emerald-900/5 dark:border-emerald-700/50 dark:from-emerald-950/70 dark:via-emerald-950/40 dark:to-sky-950/30 dark:shadow-none lg:rounded-none lg:px-5 lg:py-6 ${className}`}
      aria-label="Sugerencias de recetas GlucoLog AI"
    >
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20 dark:bg-emerald-500 dark:shadow-none">
          <ChefHat className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="dash-eyebrow text-emerald-700 dark:text-emerald-300">
                Asistente
              </p>
              <h3 className="mt-1 text-lg font-medium tracking-tight text-slate-900 dark:text-emerald-50">
                Recetas con {food.Nombre}
              </h3>
            </div>
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-light text-emerald-800 ring-1 ring-emerald-200/80 transition-colors hover:bg-emerald-100/60 disabled:opacity-50 dark:text-emerald-200 dark:ring-emerald-700/60 dark:hover:bg-emerald-900/40"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                  strokeWidth={1.5}
                />
                Actualizar
              </button>
            ) : null}
          </div>

          <p className="dash-body mt-2 text-slate-600 dark:text-emerald-200/80">
            Sugerencias según tu glucosa reciente y tu perfil. Orientación
            educativa, no sustituye consejo médico.
          </p>

          {loading ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              Preparando recetas para tu estado actual…
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-rose-700 dark:text-rose-300">{error}</p>
          ) : null}

          {result && !loading ? (
            <div className="mt-4 space-y-3">
              {result.glucoseContext ? (
                <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80 dark:bg-emerald-950/50 dark:text-emerald-200/90 dark:ring-emerald-800/60">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                  {result.glucoseContext}
                </p>
              ) : null}
              {result.summary ? (
                <p className="dash-body text-slate-700 dark:text-emerald-100/90">
                  {result.summary}
                </p>
              ) : null}

              <div className="space-y-2 pt-1">
                {result.recipes.map((recipe, index) => {
                  const open = openIndex === index;
                  return (
                    <div
                      key={`${recipe.title}-${index}`}
                      className="border border-emerald-100/90 bg-white/50 dark:border-emerald-800/50 dark:bg-emerald-950/30"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(open ? null : index)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                      >
                        <span>
                          <span className="block text-sm font-medium text-slate-900 dark:text-emerald-50">
                            {recipe.title}
                          </span>
                          <span className="dash-muted mt-0.5 block">
                            {recipe.prepMinutes
                              ? `${recipe.prepMinutes} min`
                              : null}
                            {recipe.prepMinutes && recipe.servings ? " · " : null}
                            {recipe.servings || null}
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-emerald-600 transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {open ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-t border-emerald-100/80 px-3 pb-4 pt-3 dark:border-emerald-800/50">
                              {recipe.why ? (
                                <p className="text-sm text-slate-700 dark:text-emerald-100/90">
                                  {recipe.why}
                                </p>
                              ) : null}
                              {recipe.glycemicNote ? (
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                  {recipe.glycemicNote}
                                </p>
                              ) : null}
                              {recipe.ingredients.length ? (
                                <div>
                                  <p className="dash-stat-label">Ingredientes</p>
                                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm font-light text-slate-600 dark:text-emerald-200/85">
                                    {recipe.ingredients.map((item) => (
                                      <li key={item}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                              {recipe.steps.length ? (
                                <div>
                                  <p className="dash-stat-label">Pasos</p>
                                  <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-sm font-light text-slate-600 dark:text-emerald-200/85">
                                    {recipe.steps.map((step) => (
                                      <li key={step}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              ) : null}
                              {recipe.tips.length ? (
                                <div>
                                  <p className="dash-stat-label">Tips</p>
                                  <ul className="mt-1.5 space-y-1 text-sm font-light text-slate-600 dark:text-emerald-200/85">
                                    {recipe.tips.map((tip) => (
                                      <li key={tip} className="flex gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
