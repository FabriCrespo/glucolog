"use client";

import React, { useState } from "react";
import type { NutrientDensity } from "@/types/food";
import { ChevronDown } from "lucide-react";

interface NutrientDensityCalculatorProps {
  nutrientDensity: NutrientDensity | null;
}

type DensityKey =
  | "proteinDensity"
  | "fiberDensity"
  | "mineralDensity"
  | "vitaminDensity";

const DENSITY_ROWS: {
  key: DensityKey;
  title: string;
  short: string;
  good: string;
  ok: string;
  low: string;
}[] = [
  {
    key: "proteinDensity",
    title: "Proteína",
    short: "Cuánta proteína trae respecto a sus calorías.",
    good: "Buena fuente de proteína sin tantas calorías de más.",
    ok: "Aporte moderado de proteína.",
    low: "Poca proteína por caloría. Combínalo con otros alimentos proteicos.",
  },
  {
    key: "fiberDensity",
    title: "Fibra",
    short: "Cuánta fibra trae respecto a sus calorías.",
    good: "Buena en fibra: ayuda al control de glucosa y digestión.",
    ok: "Fibra moderada.",
    low: "Poca fibra. Suma verduras, legumbres o cereales integrales.",
  },
  {
    key: "mineralDensity",
    title: "Minerales",
    short: "Resumen de minerales útiles por caloría.",
    good: "Aporta buenos minerales sin exceso de calorías.",
    ok: "Aporte mineral regular.",
    low: "Pocos minerales por caloría en este alimento.",
  },
  {
    key: "vitaminDensity",
    title: "Vitaminas",
    short: "Resumen de vitaminas por caloría.",
    good: "Buen aporte vitamínico para las calorías que da.",
    ok: "Aporte vitamínico moderado.",
    low: "Pocas vitaminas por caloría en este alimento.",
  },
];

function getLevel(value: number) {
  if (value >= 60) {
    return {
      label: "Bueno",
      tone: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      bar: "bg-emerald-500",
      tipKey: "good" as const,
    };
  }
  if (value >= 40) {
    return {
      label: "Regular",
      tone: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      bar: "bg-amber-500",
      tipKey: "ok" as const,
    };
  }
  return {
    label: "Bajo",
    tone: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    bar: "bg-slate-400",
    tipKey: "low" as const,
  };
}

const NutrientDensityCalculator = ({
  nutrientDensity,
}: NutrientDensityCalculatorProps) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!nutrientDensity) return null;

  const rows = DENSITY_ROWS.map((row) => ({
    ...row,
    value: nutrientDensity[row.key],
    level: getLevel(nutrientDensity[row.key]),
  }));

  const average =
    rows.reduce((sum, row) => sum + row.value, 0) / rows.length;
  const overall = getLevel(average);
  const goodCount = rows.filter((r) => r.value >= 60).length;

  const overallVerdict =
    average >= 60
      ? {
          title: "Nutrición eficiente",
          body: "Este alimento aporta bastantes nutrientes útiles por cada caloría.",
        }
      : average >= 40
        ? {
            title: "Nutrición regular",
            body: "Tiene algunos nutrientes buenos, pero no destaca en todos.",
          }
        : {
            title: "Pocas nutrientes por caloría",
            body: "Muchas calorías y pocos nutrientes relativos. Modera porciones o combínalo.",
          };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="dash-eyebrow">Calidad nutricional</p>
          <h3 className="dash-title mt-2 text-lg">¿Vale la pena en tu dieta?</h3>
          <p className="dash-body mt-2">
            Mide cuántos nutrientes útiles trae el alimento{" "}
            <strong className="font-medium">por cada caloría</strong>. Más alto =
            mejor aprovechamiento.
          </p>
        </div>
        <span
          className={`inline-block shrink-0 self-start border px-3 py-1.5 text-xs font-light tabular-nums ${overall.bg} ${overall.tone}`}
        >
          {overall.label} · {average.toFixed(0)}/100
        </span>
      </div>

      <div className={`mb-6 border px-4 py-4 ${overall.bg}`}>
        <p className={`dash-stat-label ${overall.tone}`}>{overallVerdict.title}</p>
        <p className="dash-body mt-1">{overallVerdict.body}</p>
      </div>

      <div className="mb-6 border border-slate-200 px-4 py-4">
        <p className="dash-stat-label">Calorías por 100 g</p>
        <p className="dash-stat-value mt-1 text-3xl text-slate-800">
          {nutrientDensity.caloriesPer100g.toFixed(0)}
          <span className="ml-2 text-sm font-light text-slate-400">kcal</span>
        </p>
        <p className="dash-muted mt-1">
          {nutrientDensity.caloriesPer100g > 300
            ? "Alimento calórico: cuida el tamaño de porción."
            : nutrientDensity.caloriesPer100g > 150
              ? "Calorías moderadas."
              : "Bajo en calorías."}
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const isOpen = expandedKey === row.key;
          const tip = row[row.level.tipKey];

          return (
            <div
              key={row.key}
              className={`border transition-colors ${row.level.bg} ${isOpen ? "border-vitality-primary/40" : ""}`}
            >
              <button
                type="button"
                onClick={() => setExpandedKey(isOpen ? null : row.key)}
                className="dash-row w-full px-4 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-light text-slate-900">
                        {row.title}
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider ${row.level.tone}`}
                      >
                        {row.level.label}
                      </span>
                    </div>
                    <p className="dash-muted mt-0.5">{row.short}</p>
                  </div>
                  <span className="dash-stat-value text-lg tabular-nums">
                    {row.value.toFixed(0)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="mt-3 h-1 w-full bg-slate-200/80">
                  <div
                    className={`h-1 transition-all ${row.level.bar}`}
                    style={{
                      width: `${Math.min(Math.max(row.value, 0), 100)}%`,
                    }}
                  />
                </div>
              </button>

              {isOpen ? (
                <div className="border-t border-slate-200/80 px-4 pb-4 pt-3">
                  <p className={`dash-accent-quote text-sm ${row.level.tone}`}>
                    {tip}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="dash-stat-label">Nutrientes en nivel bueno</span>
          <span className="dash-muted tabular-nums">
            {goodCount}/{rows.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-slate-200">
          <div
            className="h-1.5 bg-vitality-primary transition-all"
            style={{ width: `${(goodCount / rows.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NutrientDensityCalculator;
