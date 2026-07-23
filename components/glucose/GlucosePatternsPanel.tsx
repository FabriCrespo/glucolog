"use client";

import { useMemo } from "react";
import type { GlucoseRecord } from "@/types/glucose";
import { detectGlucosePatterns } from "@/lib/dashboard/glucosePatterns";

interface GlucosePatternsPanelProps {
  records: GlucoseRecord[];
  embedded?: boolean;
}

export default function GlucosePatternsPanel({
  records,
  embedded = false,
}: GlucosePatternsPanelProps) {
  const patterns = useMemo(() => detectGlucosePatterns(records), [records]);

  return (
    <section
      aria-label="Patrones de glucosa"
      className={embedded ? "" : "border-t border-slate-200 pt-10 lg:pt-14"}
    >
      {embedded ? null : (
        <>
          <p className="dash-eyebrow">Patrones</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Qué se repite en tus datos
          </h2>
          <p className="dash-body mt-3 max-w-2xl">
            Hallazgos automáticos a partir de tus lecturas, comidas y estrés.
            Orientativos, no diagnósticos.
          </p>
        </>
      )}

      <ul
        className={`${embedded ? "mt-0" : "mt-8"} divide-y divide-slate-100 dark:divide-slate-800`}
      >
        {patterns.map((p) => (
          <li key={p.id} className="flex gap-4 py-4 first:pt-0">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                p.strength === "solid" ? "bg-vitality-primary" : "bg-slate-300"
              }`}
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {p.title}
              </p>
              <p className="dash-muted mt-1">{p.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
