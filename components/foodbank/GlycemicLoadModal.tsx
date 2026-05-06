"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GlycemicLoadInfo } from "@/types/food";

interface GlycemicLoadModalProps {
  load: GlycemicLoadInfo | null;
  open: boolean;
  onClose: () => void;
}

function GlycemicModalShell({
  load,
  onClose,
}: {
  load: GlycemicLoadInfo;
  onClose: () => void;
}) {
  const cat = load.category;
  const barPct = Math.min((load.value / 20) * 100, 100);

  const tone =
    cat === "Baja"
      ? {
          dot: "bg-emerald-500",
          text: "text-emerald-700",
          bar: "bg-emerald-500",
          btn: "bg-vitality-primary hover:bg-vitality-primary-dark",
          glyph: "✓",
        }
      : cat === "Media"
        ? {
            dot: "bg-amber-500",
            text: "text-amber-700",
            bar: "bg-amber-500",
            btn: "bg-amber-500 hover:bg-amber-600",
            glyph: "!",
          }
        : {
            dot: "bg-red-500",
            text: "text-red-700",
            bar: "bg-red-500",
            btn: "bg-red-500 hover:bg-red-600",
            glyph: "⚠",
          };

  const description =
    cat === "Baja"
      ? "Excelente elección. Este alimento tiene un impacto mínimo en tus niveles de glucosa."
      : cat === "Media"
        ? "Moderación recomendada. Este alimento tiene un impacto moderado en tus niveles de glucosa."
        : "Precaución. Este alimento puede causar picos significativos en tus niveles de glucosa.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glycemic-modal-title"
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-900/20"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-50" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-50/90" />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3
              id="glycemic-modal-title"
              className="text-lg font-semibold text-slate-900 sm:text-xl"
            >
              Carga glucémica
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${tone.dot}`}
              >
                {tone.glyph}
              </div>
              <div>
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  {load.value.toFixed(1)}
                </p>
                <p className={`text-sm font-semibold ${tone.text}`}>{cat}</p>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${tone.bar}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>10</span>
              <span>20+</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">{description}</p>

          <button
            type="button"
            onClick={onClose}
            className={`mt-5 w-full rounded-xl py-2.5 text-[15px] font-semibold text-white transition-colors ${tone.btn}`}
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GlycemicLoadModal({
  load,
  open,
  onClose,
}: GlycemicLoadModalProps) {
  return (
    <AnimatePresence mode="wait">
      {open && load ? (
        <GlycemicModalShell key="glycemic" load={load} onClose={onClose} />
      ) : null}
    </AnimatePresence>
  );
}
