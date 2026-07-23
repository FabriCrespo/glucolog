"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { GlucoseRecord } from "@/types/glucose";
import type {
  PredictionPayload,
  PredictionResult,
} from "@/lib/prediction/clientFallback";
import { buildDailyFocus } from "@/lib/dashboard/dailyFocus";
import LivePredictionPanel from "@/components/glucose/LivePredictionPanel";
import PostMealCoachPanel from "@/components/glucose/PostMealCoachPanel";
import GlucosePatternsPanel from "@/components/glucose/GlucosePatternsPanel";
import DashboardAgentChat from "@/components/glucose/DashboardAgentChat";

type ServiceId =
  | "focus"
  | "prediction"
  | "postMeal"
  | "patterns"
  | "chat";

interface DashboardServicesAccordionProps {
  records: GlucoseRecord[];
  userId: string;
  prediction: {
    latestRecord: GlucoseRecord | null;
    payload: PredictionPayload;
    result: PredictionResult | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
}

function ServiceFold({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: ServiceId;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: (id: ServiceId) => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200/90 last:border-b-0 dark:border-slate-800">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/25"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium tracking-wide text-slate-900 dark:text-slate-50">
            {title}
          </span>
          <span className="dash-muted mt-1 block">{subtitle}</span>
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-emerald-600 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-8 pt-1">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Servicios IA / coaching del dashboard, agrupados y desplegables.
 */
export default function DashboardServicesAccordion({
  records,
  userId,
  prediction,
}: DashboardServicesAccordionProps) {
  const focus = useMemo(() => buildDailyFocus(records), [records]);
  const [openId, setOpenId] = useState<ServiceId | null>("focus");

  const onToggle = (id: ServiceId) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Servicios GlucoLog"
      className="mt-14 border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white px-4 py-6 dark:border-emerald-800/50 dark:from-emerald-950/40 dark:to-slate-950 lg:mt-16 lg:px-6 lg:py-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-emerald-200/70 pb-5 dark:border-emerald-800/50">
        <div>
          <p className="dash-eyebrow flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            Servicios
          </p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Lectura inteligente
          </h2>
          <p className="dash-body mt-2 max-w-xl">
            Foco del día, predicción, post-comida, patrones y chat. Abre solo lo
            que necesites.
          </p>
        </div>
      </div>

      <div className="mt-1">
        <ServiceFold
          id="focus"
          title="Foco de hoy"
          subtitle={focus.headline}
          open={openId === "focus"}
          onToggle={onToggle}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-800/70 dark:text-emerald-400/80">
            {focus.tag}
          </p>
          <p className="dash-accent-quote mt-3 text-sm lg:text-[15px]">
            {focus.headline}
          </p>
          <p className="dash-body mt-3">{focus.detail}</p>
        </ServiceFold>

        <ServiceFold
          id="prediction"
          title="Predicción en vivo"
          subtitle="Próxima lectura estimada según tu último registro"
          open={openId === "prediction"}
          onToggle={onToggle}
        >
          <LivePredictionPanel
            embedded
            latestRecord={prediction.latestRecord}
            payload={prediction.payload}
            result={prediction.result}
            loading={prediction.loading}
            error={prediction.error}
            onRefresh={() => void prediction.refresh()}
          />
        </ServiceFold>

        <ServiceFold
          id="postMeal"
          title="Después de comer"
          subtitle="Impacto de tu última comida y cuándo volver a comer"
          open={openId === "postMeal"}
          onToggle={onToggle}
        >
          <PostMealCoachPanel
            embedded
            records={records}
            prediction={prediction.result}
            predictionLoading={prediction.loading}
          />
        </ServiceFold>

        <ServiceFold
          id="patterns"
          title="Patrones"
          subtitle="Días, comidas y estrés que se repiten en tus datos"
          open={openId === "patterns"}
          onToggle={onToggle}
        >
          <GlucosePatternsPanel embedded records={records} />
        </ServiceFold>

        <ServiceFold
          id="chat"
          title="Pregunta a GlucoLog AI"
          subtitle="Ej. ¿Qué hago si estoy en 190?"
          open={openId === "chat"}
          onToggle={onToggle}
        >
          <DashboardAgentChat
            embedded
            userId={userId}
            latestGlucose={records[0]?.glucoseLevel ?? null}
          />
        </ServiceFold>
      </div>
    </section>
  );
}
