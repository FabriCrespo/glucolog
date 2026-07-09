"use client";

import React, { useState } from "react";
import type { MicronutrientStatus } from "@/types/food";
import { ChevronDown } from "lucide-react";

interface MicronutrientBalanceProps {
  micronutrientStatus: MicronutrientStatus | null;
}

type NutrientKey = "magnesium" | "zinc" | "calcium" | "potassium";

const NUTRIENT_INFO: Record<
  NutrientKey,
  { name: string; why: string; good: string; low: string; high: string }
> = {
  magnesium: {
    name: "Magnesio",
    why: "Ayuda a músculos, nervios y energía.",
    good: "Buen aporte de magnesio en este alimento.",
    low: "Aporta poco magnesio. Combínalo con verduras, frutos secos o legumbres.",
    high: "Tiene mucho magnesio. Normal en la mayoría de dietas; consulta a tu médico si tienes restricciones.",
  },
  zinc: {
    name: "Zinc",
    why: "Apoya defensas y recuperación del cuerpo.",
    good: "Buen aporte de zinc en este alimento.",
    low: "Aporta poco zinc. Puedes complementar con carnes magras, legumbres o semillas.",
    high: "Tiene bastante zinc. Modera porciones si sigues una dieta especial.",
  },
  calcium: {
    name: "Calcio",
    why: "Importante para huesos y dientes.",
    good: "Buen aporte de calcio en este alimento.",
    low: "Aporta poco calcio. Combínalo con lácteos, verduras de hoja verde o alimentos fortificados.",
    high: "Tiene mucho calcio. Útil, pero consulta a tu médico si tienes restricciones renales.",
  },
  potassium: {
    name: "Potasio",
    why: "Ayuda al corazón, músculos y equilibrio de líquidos.",
    good: "Buen aporte de potasio en este alimento.",
    low: "Aporta poco potasio. Puedes sumar frutas, verduras o legumbres.",
    high: "Tiene mucho potasio. Si tienes problemas renales, consulta con tu médico.",
  },
};

function statusMeta(status: string) {
  switch (status) {
    case "good":
      return {
        label: "Bueno",
        tone: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
        dot: "bg-emerald-500",
        icon: "✓",
      };
    case "low":
      return {
        label: "Poco",
        tone: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        dot: "bg-amber-500",
        icon: "↓",
      };
    case "high":
      return {
        label: "Mucho",
        tone: "text-red-700",
        bg: "bg-red-50 border-red-200",
        dot: "bg-red-500",
        icon: "↑",
      };
    default:
      return {
        label: "—",
        tone: "text-slate-600",
        bg: "bg-slate-50 border-slate-200",
        dot: "bg-slate-400",
        icon: "·",
      };
  }
}

const MicronutrientBalance = ({
  micronutrientStatus,
}: MicronutrientBalanceProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "good" | "watch">("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!micronutrientStatus) return null;

  const entries = Object.entries(micronutrientStatus);
  const goodCount = entries.filter(([, d]) => d.status === "good").length;
  const watchCount = entries.filter(
    ([, d]) => d.status === "low" || d.status === "high"
  ).length;

  const filtered = entries.filter(([, data]) => {
    if (activeTab === "all") return true;
    if (activeTab === "good") return data.status === "good";
    return data.status === "low" || data.status === "high";
  });

  const overallVerdict =
    goodCount >= 3
      ? {
          title: "Buen perfil de minerales",
          body: "La mayoría de minerales están en un rango saludable para este alimento.",
          className: "border-emerald-200 bg-emerald-50/40",
        }
      : watchCount >= 2
        ? {
            title: "Revisa algunos minerales",
            body: "Hay minerales en cantidad baja o alta. Mira los detalles abajo.",
            className: "border-amber-200 bg-amber-50/40",
          }
        : {
            title: "Perfil mixto",
            body: "Algunos minerales van bien y otros conviene complementar.",
            className: "border-slate-200 bg-slate-50/40",
          };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="dash-eyebrow">Minerales</p>
          <h3 className="dash-title mt-2 text-lg">¿Qué minerales aporta?</h3>
          <p className="dash-body mt-2">
            Valores por cada <strong className="font-medium">100 g</strong> del
            alimento. Toca cada mineral para ver si conviene o no en tu dieta.
          </p>
        </div>
        <div className="dash-pill dash-pill-idle tabular-nums">
          {goodCount} de {entries.length} buenos
        </div>
      </div>

      <div className={`mb-6 border px-4 py-4 ${overallVerdict.className}`}>
        <p className="dash-stat-label text-emerald-900">{overallVerdict.title}</p>
        <p className="dash-body mt-1">{overallVerdict.body}</p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        {[
          { color: "bg-emerald-500", label: "Bueno", desc: "Cantidad saludable" },
          { color: "bg-amber-500", label: "Poco", desc: "Aporta poco; combina con otros" },
          { color: "bg-red-500", label: "Mucho", desc: "Alto en este alimento" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 border border-slate-100 px-3 py-2.5"
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
            <div>
              <p className="text-sm font-light text-slate-800">{item.label}</p>
              <p className="dash-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap border-b border-slate-200">
        {(
          [
            ["all", `Todos (${entries.length})`],
            ["good", `Buenos (${goodCount})`],
            ["watch", `Revisar (${watchCount})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`dash-tab ${activeTab === id ? "dash-tab-active" : "dash-tab-idle"}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="dash-body py-6 text-center text-slate-500">
            No hay minerales en este filtro.
          </p>
        ) : (
          filtered.map(([key, data]) => {
            const k = key as NutrientKey;
            const info = NUTRIENT_INFO[k];
            const meta = statusMeta(data.status);
            const isOpen = expandedKey === key;
            const tip =
              data.status === "good"
                ? info.good
                : data.status === "low"
                  ? info.low
                  : info.high;

            return (
              <div
                key={key}
                className={`border transition-colors ${meta.bg} ${isOpen ? "border-vitality-primary/40" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedKey(isOpen ? null : key)}
                  className="dash-row flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-white ${meta.dot}`}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-light text-slate-900">
                        {info.name}
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="dash-muted mt-0.5">
                      {data.value.toFixed(1)} mg · por 100 g
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-200/80 px-4 pb-4 pt-3">
                    <p className="dash-body">{info.why}</p>
                    <p className={`dash-accent-quote mt-3 text-sm ${meta.tone}`}>
                      {tip}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="dash-stat-label">Minerales en rango saludable</span>
          <span className="dash-muted tabular-nums">
            {goodCount}/{entries.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-slate-200">
          <div
            className="h-1.5 bg-vitality-primary transition-all"
            style={{ width: `${(goodCount / entries.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MicronutrientBalance;
