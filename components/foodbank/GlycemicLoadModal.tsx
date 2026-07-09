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
        }
      : cat === "Media"
        ? {
            dot: "bg-amber-500",
            text: "text-amber-700",
            bar: "bg-amber-500",
          }
        : {
            dot: "bg-red-500",
            text: "text-red-700",
            bar: "bg-red-500",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glycemic-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="relative mx-4 w-full max-w-md border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/10"
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="dash-eyebrow">Resultado</p>
            <h3 id="glycemic-modal-title" className="dash-title mt-1 text-lg">
              Carga glucémica
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 transition-colors hover:text-vitality-primary"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="border border-slate-200 bg-slate-50/40 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.dot}`}
            >
              <span className="text-xs font-light text-white">
                {cat === "Baja" ? "✓" : cat === "Media" ? "!" : "⚠"}
              </span>
            </div>
            <div>
              <p className="dash-stat-value text-2xl text-slate-900">
                {load.value.toFixed(1)}
              </p>
              <p className={`dash-muted font-medium ${tone.text}`}>{cat}</p>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden bg-slate-200">
            <div
              className={`h-full transition-all ${tone.bar}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>0</span>
            <span>10</span>
            <span>20+</span>
          </div>
        </div>

        <p className="dash-body mt-4">{description}</p>

        <button
          type="button"
          onClick={onClose}
          className="dash-btn-outline-active mt-5 w-full py-3 text-sm font-light"
        >
          Entendido
        </button>
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
