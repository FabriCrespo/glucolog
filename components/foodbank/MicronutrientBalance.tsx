"use client";

import React, { useId, useState } from "react";
import type { MicronutrientStatus } from "@/types/food";
import { HelpCircle, Info } from "lucide-react";

interface MicronutrientBalanceProps {
  micronutrientStatus: MicronutrientStatus | null;
}

/** Mismos límites que `calculateMicronutrientStatus` en lib (mg por 100 g del alimento). */
const REFERENCE_PER_100G = {
  magnesium: { low: 30, high: 400 },
  zinc: { low: 2, high: 15 },
  calcium: { low: 100, high: 1000 },
  potassium: { low: 300, high: 3500 },
} as const;

type NutrientKey = keyof typeof REFERENCE_PER_100G;

const nutrientCopy: Record<
  NutrientKey,
  {
    name: string;
    oneLineKid: string;
    whyItMatters: string;
    icon: React.ReactNode;
  }
> = {
  magnesium: {
    name: "Magnesio",
    oneLineKid:
      "Ayuda a que músculos y nervios funcionen bien y participa en muchas reacciones del cuerpo.",
    whyItMatters:
      "En esta tabla comparamos cuánto magnesio hay en 100 g de este alimento con un rango orientativo (entre cantidad mínima y máxima que usamos solo para esta vista). No sustituye consejo médico ni analíticas.",
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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  zinc: {
    name: "Zinc",
    oneLineKid:
      "Colabora con las defensas del cuerpo y con la cicatrización cuando hay heridas.",
    whyItMatters:
      "El número que ves es mg de zinc por 100 g del alimento. Los colores solo dicen si cae por debajo, dentro o por encima del rango que usamos aquí como referencia simple.",
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
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
  calcium: {
    name: "Calcio",
    oneLineKid:
      "Es importante para huesos y dientes; también interviene en nervios y músculos.",
    whyItMatters:
      "Aquí no medimos el calcio en tu sangre: solo lo que aportan 100 g de este alimento según la base de datos.",
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
  potassium: {
    name: "Potasio",
    oneLineKid:
      "Ayuda al equilibrio de líquidos y al funcionimiento normal del corazón y los músculos.",
    whyItMatters:
      "Si ves “elevado” o “bajo”, hablamos solo del contenido en este alimento (por 100 g), no de tu ingesta total del día.",
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
};

function statusLabels(status: string) {
  switch (status) {
    case "good":
      return {
        short: "En rango",
        pillClass: "bg-emerald-600",
        explain:
          "La cantidad por 100 g cae entre el mínimo y el máximo que usamos como referencia en esta pantalla.",
      };
    case "low":
      return {
        short: "Poca cantidad",
        pillClass: "bg-amber-500",
        explain:
          "Por debajo del mínimo de referencia en esta vista: el alimento aporta poco de este mineral por 100 g.",
      };
    case "high":
      return {
        short: "Mucha cantidad",
        pillClass: "bg-red-500",
        explain:
          "Por encima del máximo de referencia en esta vista: hay bastante de este mineral en 100 g de este alimento.",
      };
    default:
      return {
        short: "Sin clasificar",
        pillClass: "bg-slate-500",
        explain: "No pudimos clasificar con los datos disponibles.",
      };
  }
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

const MicronutrientBalance = ({
  micronutrientStatus,
}: MicronutrientBalanceProps) => {
  if (!micronutrientStatus) return null;

  const [activeTab, setActiveTab] = useState<"all" | "optimal" | "concern">(
    "all"
  );

  const totalNutrients = Object.keys(micronutrientStatus).length;
  const optimalNutrients = Object.values(micronutrientStatus).filter(
    (d) => d.status === "good"
  ).length;
  const lowNutrients = Object.values(micronutrientStatus).filter(
    (d) => d.status === "low"
  ).length;
  const highNutrients = Object.values(micronutrientStatus).filter(
    (d) => d.status === "high"
  ).length;
  const optimalPercentage = (optimalNutrients / totalNutrients) * 100;

  const filteredNutrients = Object.entries(micronutrientStatus).filter(
    ([_, data]) => {
      if (activeTab === "all") return true;
      if (activeTab === "optimal") return data.status === "good";
      if (activeTab === "concern")
        return data.status === "low" || data.status === "high";
      return true;
    }
  );

  const generateRecommendations = () => {
    const out: string[] = [];
    if (lowNutrients > 0) {
      out.push(
        "Hay al menos un mineral en cantidad baja en este alimento (por 100 g). Puedes combinarlo con otros alimentos para compensar."
      );
    }
    if (highNutrients > 0) {
      out.push(
        "Hay al menos un mineral en cantidad alta en este alimento (por 100 g). Si tienes dudas médicas o dietas especiales, consulta con un profesional."
      );
    }
    if (optimalPercentage < 50) {
      out.push(
        "Varios minerales salen fuera del rango simple que usamos aquí; es solo una guía sobre este producto, no sobre tu día completo."
      );
    } else if (optimalPercentage >= 80) {
      out.push(
        "En esta vista, la mayoría de los minerales caen en el rango de referencia para 100 g de este alimento."
      );
    }
    return out;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        {/* Encabezado + ayuda principal */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Minerales en este alimento
              </h3>
              <InfoPopover label="Qué muestra esta tarjeta">
                <p className="font-medium text-slate-900">
                  Lectura fácil de esta sección
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] text-slate-600">
                  <li>
                    Aquí hablamos de cuatro minerales que vienen en la tabla
                    nutricional del alimento que elegiste.
                  </li>
                  <li>
                    Todos los números son por{" "}
                    <strong className="text-slate-800">100 gramos</strong> de
                    ese producto (no es todo lo que comes en un día).
                  </li>
                  <li>
                    Los colores comparan contra un{" "}
                    <strong className="text-slate-800">
                      rango de referencia simple
                    </strong>{" "}
                    solo para esta pantalla; no reemplaza análisis de sangre ni
                    diagnóstico.
                  </li>
                </ul>
              </InfoPopover>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Cuánto aportan{" "}
              <strong className="font-semibold text-slate-800">
                100 g de este alimento
              </strong>{" "}
              de calcio, potasio, magnesio y zinc, comparado con un rango
              orientativo (no es tu ingesta diaria total).
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
            <span className="tabular-nums">{optimalPercentage.toFixed(0)}%</span>
            <span className="hidden font-normal sm:inline">
              minerales “en rango”
            </span>
            <span className="font-normal sm:hidden">en rango</span>
          </div>
        </div>

        {/* Caja “para niños” */}
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
                “Este cuadrito dice cuántas ‘piezas pequeñas’ de sustancias
                buenas para el cuerpo hay en un trozo fijo del alimento (100 g).
                Verde = cantidad medida en una zona que aquí consideramos OK;
                amarillo = pocas; rojo = muchas en ese trozo. Tu médico o
                nutricionista es quien puede hablar de lo que tú necesitas cada
                día.”
              </p>
            </div>
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Qué significan los colores aquí
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex gap-2 rounded-lg bg-white/80 p-2.5 ring-1 ring-slate-100">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Verde · En rango
                </p>
                <p className="text-xs leading-snug text-slate-600">
                  Entre el mínimo y el máximo de referencia (por 100 g) en esta
                  vista.
                </p>
              </div>
            </div>
            <div className="flex gap-2 rounded-lg bg-white/80 p-2.5 ring-1 ring-slate-100">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Amarillo · Poco
                </p>
                <p className="text-xs leading-snug text-slate-600">
                  Por debajo del mínimo de referencia en esta tabla (no significa
                  que estés enfermo).
                </p>
              </div>
            </div>
            <div className="flex gap-2 rounded-lg bg-white/80 p-2.5 ring-1 ring-slate-100">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Rojo · Mucho
                </p>
                <p className="text-xs leading-snug text-slate-600">
                  Por encima del máximo de referencia en esta tabla (contexto del
                  alimento, no del día entero).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra resumen */}
        <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4 ring-1 ring-slate-100/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800">
              Resumen rápido (4 minerales)
            </span>
            <InfoPopover label="La barra de colores">
              <p className="text-[13px] text-slate-600">
                Cada trozo de la barra cuenta cuántos de los cuatro minerales
                caen en verde (en rango), amarillo (poco) o rojo (mucho) según
                los límites que usa esta pantalla.
              </p>
            </InfoPopover>
          </div>
          <div className="flex h-9 overflow-hidden rounded-lg">
            <div
              className="flex min-w-0 items-center justify-center bg-emerald-600 text-xs font-semibold text-white"
              style={{
                width: `${Math.max((optimalNutrients / totalNutrients) * 100, 0)}%`,
              }}
              title={`En rango: ${optimalNutrients}`}
            >
              {optimalNutrients > 0 ? optimalNutrients : ""}
            </div>
            <div
              className="flex min-w-0 items-center justify-center bg-amber-500 text-xs font-semibold text-white"
              style={{
                width: `${Math.max((lowNutrients / totalNutrients) * 100, 0)}%`,
              }}
              title={`Poco: ${lowNutrients}`}
            >
              {lowNutrients > 0 ? lowNutrients : ""}
            </div>
            <div
              className="flex min-w-0 items-center justify-center bg-red-500 text-xs font-semibold text-white"
              style={{
                width: `${Math.max((highNutrients / totalNutrients) * 100, 0)}%`,
              }}
              title={`Mucho: ${highNutrients}`}
            >
              {highNutrients > 0 ? highNutrients : ""}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>
              Verde = {optimalNutrients} en rango · Amarillo = {lowNutrients}{" "}
              poco · Rojo = {highNutrients} mucho
            </span>
          </div>
        </div>

        {/* Pestañas */}
        <div className="mb-4 flex flex-wrap border-b border-slate-200">
          <button
            type="button"
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-vitality-primary text-vitality-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Todos ({totalNutrients})
          </button>
          <button
            type="button"
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "optimal"
                ? "border-b-2 border-vitality-primary text-vitality-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("optimal")}
          >
            Solo en rango ({optimalNutrients})
          </button>
          <button
            type="button"
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "concern"
                ? "border-b-2 border-vitality-primary text-vitality-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("concern")}
          >
            Poco o mucho ({lowNutrients + highNutrients})
          </button>
        </div>

        {/* Tarjetas por mineral */}
        <div className="space-y-4">
          {filteredNutrients.length > 0 ? (
            filteredNutrients.map(([key, data]) => {
              const k = key as NutrientKey;
              const info = nutrientCopy[k];
              const status = statusLabels(data.status);
              const range = REFERENCE_PER_100G[k];

              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.pillClass}`}
                    >
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-slate-900">
                          {info.name}
                        </span>
                        <InfoPopover label={info.name}>
                          <p className="text-[13px] text-slate-600">
                            {info.whyItMatters}
                          </p>
                        </InfoPopover>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${status.pillClass}`}
                        >
                          {status.short}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {info.oneLineKid}
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-lg font-semibold tabular-nums text-slate-900">
                          {data.value.toFixed(1)}{" "}
                          <span className="text-base font-normal text-slate-500">
                            mg
                          </span>
                        </span>
                        <span className="text-xs text-slate-500">
                          por 100 g de este alimento
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Referencia en esta vista: entre {range.low} y {range.high}{" "}
                        mg por 100 g · {status.explain}
                      </p>

                      {/* Tres casillas: niños ven en cuál “caja” cae este alimento */}
                      <div className="mt-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          ¿En cuál grupo cae este alimento?
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-lg text-center text-[11px] font-semibold leading-tight sm:text-xs">
                          <div
                            className={`px-1 py-3 sm:py-2.5 ${
                              data.status === "low"
                                ? "bg-amber-200 text-amber-950 ring-2 ring-amber-400 ring-offset-1"
                                : "bg-amber-50 text-amber-900/90"
                            }`}
                          >
                            Poca cantidad
                          </div>
                          <div
                            className={`px-1 py-3 sm:py-2.5 ${
                              data.status === "good"
                                ? "bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500 ring-offset-1"
                                : "bg-emerald-50 text-emerald-900/90"
                            }`}
                          >
                            En rango
                          </div>
                          <div
                            className={`px-1 py-3 sm:py-2.5 ${
                              data.status === "high"
                                ? "bg-red-200 text-red-950 ring-2 ring-red-400 ring-offset-1"
                                : "bg-red-50 text-red-900/90"
                            }`}
                          >
                            Mucha cantidad
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">
                          La casilla resaltada es la que coincide con el número de arriba
                          y los límites {range.low}–{range.high} mg por 100 g en esta vista.
                        </p>
                      </div>

                      <details className="group mt-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm">
                        <summary className="cursor-pointer list-none font-medium text-vitality-primary outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                          <span className="inline-flex items-center gap-1">
                            Más detalles para adultos
                            <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                          </span>
                        </summary>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                          Los límites ({range.low}–{range.high} mg por 100 g) sirven
                          solo para colorear esta tarjeta. Personas con enfermedades
                          renales, embarazo u otras condiciones necesitan criterios
                          distintos: pregunta siempre a tu equipo de salud.
                        </p>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-sm text-slate-500">
              No hay minerales en esta categoría con el filtro actual.
            </p>
          )}
        </div>

        {recommendations.length > 0 && (
          <ul className="mt-5 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-950">
            {recommendations.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-800">
            Equilibrio en esta vista
          </span>
          <span className="text-sm tabular-nums text-slate-600">
            {optimalNutrients} de {totalNutrients} minerales en el rango de
            referencia
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200/90">
          <div
            className="h-2 rounded-full bg-vitality-primary transition-all"
            style={{ width: `${optimalPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MicronutrientBalance;
