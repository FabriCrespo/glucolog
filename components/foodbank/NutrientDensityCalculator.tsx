"use client";

import React, { useId, useState } from "react";
import type { NutrientDensity } from "@/types/food";
import { HelpCircle, Info } from "lucide-react";

interface NutrientDensityCalculatorProps {
  nutrientDensity: NutrientDensity | null;
}

function InfoPopover({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="rounded-full p-1 text-slate-400 outline-none ring-vitality-primary/40 transition-colors hover:bg-slate-100 hover:text-vitality-primary focus-visible:ring-2"
        aria-expanded={open}
        aria-controls={headingId}
        onClick={() => setOpen((v) => !v)}
        title={`Información: ${label}`}
      >
        <HelpCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        <span className="sr-only">Información sobre {label}</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            aria-label="Cerrar información"
            onClick={() => setOpen(false)}
          />
          <div
            id={headingId}
            role="tooltip"
            className="absolute left-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white p-3 text-left text-sm leading-relaxed text-slate-700 shadow-lg sm:left-auto sm:right-0 sm:w-80"
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function getDensityLevel(value: number) {
  if (value >= 80)
    return {
      label: "Muy alto",
      pillClass: "bg-emerald-600",
      textClass: "text-emerald-800",
    };
  if (value >= 60)
    return {
      label: "Alto",
      pillClass: "bg-emerald-500",
      textClass: "text-emerald-800",
    };
  if (value >= 40)
    return {
      label: "Medio",
      pillClass: "bg-amber-500",
      textClass: "text-amber-900",
    };
  return {
    label: "Bajo",
    pillClass: "bg-slate-500",
    textClass: "text-slate-700",
  };
}

const densityRows: {
  key: keyof Pick<
    NutrientDensity,
    "proteinDensity" | "fiberDensity" | "mineralDensity" | "vitaminDensity"
  >;
  title: string;
  kidLine: string;
  adultHelp: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "proteinDensity",
    title: "Proteína frente a las calorías",
    kidLine:
      "Dice si este alimento trae bastante proteína comparado con la energía (calorías) que te da en 100 g.",
    adultHelp:
      "Es un número interno de la app: relaciona gramos de proteína con las kcal de 100 g. No es el porcentaje de proteína en la etiqueta del envase ni tu objetivo diario.",
    icon: (
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    key: "fiberDensity",
    title: "Fibra frente a las calorías",
    kidLine:
      "Si el número es alto, en 100 g hay bastante fibra para la cantidad de energía que aporta.",
    adultHelp:
      "Combina gramos de fibra con las kcal por 100 g. Sirve para comparar alimentos entre sí en esta tabla, no como recomendación médica.",
    icon: (
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  {
    key: "mineralDensity",
    title: "Minerales (resumen)",
    kidLine:
      "Junta varios minerales del alimento en un solo puntaje para ver si va ‘nutriente arriba y calorías abajo’.",
    adultHelp:
      "Mezcla magnesio, zinc, calcio y potasio con pesos fijos respecto a cantidades de referencia y lo relaciona con las kcal. Es un índice de la app, no un análisis de laboratorio.",
    icon: (
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    key: "vitaminDensity",
    title: "Vitaminas (resumen)",
    kidLine:
      "Resume algunas vitaminas del alimento en un número fácil de comparar con otros productos de la lista.",
    adultHelp:
      "Incluye vitamina B6, B12 y ácido fólico según los datos de la base; es un índice orientativo para esta pantalla.",
    icon: (
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];

const NutrientDensityCalculator = ({
  nutrientDensity,
}: NutrientDensityCalculatorProps) => {
  if (!nutrientDensity) return null;

  const rowsWithValues = densityRows.map((row) => ({
    ...row,
    value: nutrientDensity[row.key],
  }));

  const averageDensity =
    rowsWithValues.reduce((s, r) => s + r.value, 0) / rowsWithValues.length;
  const overallLevel = getDensityLevel(averageDensity);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Nutrientes por caloría (100 g)
              </h3>
              <InfoPopover label="Qué es la densidad nutricional aquí">
                <p className="font-medium text-slate-900">
                  Lectura fácil de esta sección
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] text-slate-600">
                  <li>
                    La “densidad” aquí significa:{" "}
                    <strong className="text-slate-800">
                      cuántos nutrientes buenos van en cada caloría
                    </strong>{" "}
                    de <strong className="text-slate-800">100 g</strong> de este
                    alimento.
                  </li>
                  <li>
                    Los porcentajes que ves{" "}
                    <strong className="text-slate-800">
                      no son la etiqueta del envase
                    </strong>{" "}
                    ni tu ingesta diaria recomendada: son índices calculados en
                    Glucolog para comparar alimentos entre sí.
                  </li>
                  <li>
                    Un número alto suele indicar que el alimento aporta bastante
                    proteína, fibra, minerales o vitaminas{" "}
                    <em>en relación</em> con sus calorías.
                  </li>
                </ul>
              </InfoPopover>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Compara cuánta proteína, fibra, minerales y vitaminas hay{" "}
              <strong className="font-semibold text-slate-800">
                por cada caloría
              </strong>{" "}
              en 100 g del producto seleccionado.
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold text-white ${overallLevel.pillClass}`}
          >
            <span className="tabular-nums">
              Promedio: {averageDensity.toFixed(0)}%
            </span>
            <span className="hidden font-normal opacity-95 sm:inline">
              ({overallLevel.label})
            </span>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-sky-950">
          <div className="flex gap-2">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-sky-700"
              strokeWidth={2}
              aria-hidden
            />
            <div>
              <p className="font-semibold text-sky-950">
                Si lo lees en voz alta a un niño
              </p>
              <p className="mt-1 text-[13px] text-sky-900/95">
                “Imagina que cada caloría es una cajita pequeña. Esta pantalla
                mira cuántas cosas buenas (proteína, fibra, etc.) entran en esas
                cajitas cuando comes 100 g de este alimento. No dice si estás
                sano o no: solo ayuda a comparar un alimento con otro en la
                lista.”
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Qué significan las etiquetas del promedio
          </p>
          <div className="grid gap-2 text-[13px] leading-snug text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-emerald-800">Muy alto / Alto:</span>{" "}
              muchos nutrientes “por caloría” en esta escala de la app.
            </p>
            <p>
              <span className="font-semibold text-amber-800">Medio:</span> valor
              intermedio.
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-slate-800">Bajo:</span> en esta
              escala, pocos nutrientes por caloría (pero el alimento puede ser
              útil por otras razones).
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-vitality-primary to-emerald-700 p-4 shadow-md shadow-emerald-900/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="text-sm font-medium text-white/95">
                Energía en 100 g de este alimento
              </p>
              <InfoPopover label="Calorías">
                <p className="text-[13px] text-slate-600">
                  Es la energía estimada por 100 g según la tabla nutricional.
                  Las barras de abajo comparan nutrientes con esa energía.
                </p>
              </InfoPopover>
            </div>
            <p className="text-2xl font-bold tabular-nums text-white">
              {nutrientDensity.caloriesPer100g.toFixed(1)}{" "}
              <span className="text-base font-normal text-white/90">kcal</span>
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center self-end rounded-full bg-white/20 sm:self-auto">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          {rowsWithValues.map((row) => {
            const level = getDensityLevel(row.value);
            return (
              <div
                key={row.key}
                className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vitality-primary">
                    {row.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-900">
                        {row.title}
                      </span>
                      <InfoPopover label={row.title}>
                        <p className="text-[13px] text-slate-600">
                          {row.adultHelp}
                        </p>
                      </InfoPopover>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${level.pillClass}`}
                      >
                        {level.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {row.kidLine}
                    </p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                      <span className="text-lg font-semibold tabular-nums text-slate-900">
                        {row.value.toFixed(1)}
                        <span className="ml-1 text-base font-normal text-slate-500">
                          puntos (escala app)
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200/90">
                      <div
                        className="h-2.5 rounded-full bg-vitality-primary transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(Math.max(row.value, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      La barra llena hasta {Math.min(row.value, 100).toFixed(0)}{" "}
                      en una escala de 0 a 100 para esta vista (no es % de la
                      etiqueta del envase).
                    </p>
                    <details className="group mt-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm">
                      <summary className="cursor-pointer list-none font-medium text-vitality-primary outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex items-center gap-1">
                          Más detalles para adultos
                          <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                        </span>
                      </summary>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                        Los valores salen de los mismos datos de la tabla de
                        alimentos que usa Glucolog. Si tienes necesidades
                        médicas especiales (diabetes, riñón, embarazo, etc.),
                        usa estos números solo como orientación y consulta a tu
                        equipo de salud.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-800">
            Promedio de los cuatro índices (esta vista)
          </span>
          <span className="text-sm font-bold tabular-nums text-slate-900">
            {averageDensity.toFixed(1)}{" "}
            <span className="font-normal text-slate-500">puntos</span>
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200/90">
          <div
            className="h-2 rounded-full bg-vitality-primary transition-all"
            style={{ width: `${Math.min(Math.max(averageDensity, 0), 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          El promedio simplifica cuatro índices distintos; un alimento puede ser
          alto en fibra y medio en proteínas, por ejemplo.
        </p>
      </div>
    </div>
  );
};

export default NutrientDensityCalculator;
