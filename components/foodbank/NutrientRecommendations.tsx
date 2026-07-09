import React, { useState, useEffect } from "react";
import { NutritionalRecommendation } from "@/types/food";
import { AnimatePresence, motion } from "framer-motion";
import type { FoodItem } from "@/types/food";

interface NutrientRecommendationsProps {
  recommendations: NutritionalRecommendation[];
  selectedFood: FoodItem | null;
}

const NutrientRecommendations = ({
  recommendations,
  selectedFood,
}: NutrientRecommendationsProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    setExpandedIndex(null);
  }, [selectedFood, recommendations]);

  if (!selectedFood || recommendations.length === 0) return null;

  const meta = (type: string) => {
    switch (type) {
      case "complement":
        return {
          title: "Combínalo con",
          badge: "Mejora tu plato",
          tone: "text-sky-800",
          bg: "border-sky-200 bg-sky-50/30",
          extra:
            "Mezclar alimentos distintos suele equilibrar mejor tu comida y ayuda al control de glucosa.",
        };
      case "caution":
        return {
          title: "Ten cuidado",
          badge: "Atención",
          tone: "text-amber-800",
          bg: "border-amber-200 bg-amber-50/30",
          extra:
            "Si tienes diabetes o tomas medicación, revisa porciones y horarios con tu médico.",
        };
      default:
        return {
          title: "Buena elección",
          badge: "Recomendado",
          tone: "text-emerald-800",
          bg: "border-emerald-200 bg-emerald-50/30",
          extra:
            "Este alimento encaja bien en una dieta orientada al control de glucosa.",
        };
    }
  };

  return (
    <section
      aria-label="Recomendaciones"
      className="mt-10 border-t border-slate-200 pt-10 lg:mt-14 lg:pt-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Para tu dieta</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Qué hacer con este alimento
          </h2>
          <p className="dash-body mt-2">
            Consejos simples basados en lo que elegiste. Toca cada uno para más
            detalle.
          </p>
        </div>
        <p className="dash-muted tabular-nums">
          {recommendations.length}{" "}
          {recommendations.length === 1 ? "consejo" : "consejos"}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <AnimatePresence>
          {recommendations.map((rec, index) => {
            const m = meta(rec.type);
            const isOpen = expandedIndex === index;

            return (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`border ${m.bg}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isOpen ? null : index)}
                  className="dash-row w-full px-4 py-4 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider ${m.tone}`}
                      >
                        {m.badge}
                      </span>
                      <p className={`mt-1 text-sm font-light ${m.tone}`}>
                        {m.title}
                      </p>
                      <p className="dash-body mt-2">{rec.message}</p>
                    </div>
                    <svg
                      className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="dash-accent-quote mx-4 mb-4 text-sm">
                        {m.extra}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default NutrientRecommendations;
