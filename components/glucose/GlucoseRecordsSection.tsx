"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, Plus, X } from "lucide-react";
import type { Dispatch } from "react";
import { DATE_RANGE_OPTIONS } from "@/constants/glucoseDashboard";
import type { GlucoseFormAction } from "@/reducers/glucoseFormReducer";
import type {
  DashboardFormFeedback,
  GlucoseFormSnapshot,
} from "@/types/dashboard-glucose";
import type { GlucoseRecord } from "@/types/glucose";
import GlucoseForm from "@/components/glucose/GlucoseForm";
import GlucoseTable from "@/components/glucose/GlucoseTable";

interface GlucoseRecordsSectionProps {
  records: GlucoseRecord[];
  fetchingRecords: boolean;
  fetchError: string | null;
  form: GlucoseFormSnapshot;
  dispatch: Dispatch<GlucoseFormAction>;
  submitting: boolean;
  feedback: DashboardFormFeedback | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDateRangeChange: (value: string) => void;
}

export default function GlucoseRecordsSection({
  records,
  fetchingRecords,
  fetchError,
  form,
  dispatch,
  submitting,
  feedback,
  handleSubmit,
  handleDateRangeChange,
}: GlucoseRecordsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [showIntervals, setShowIntervals] = useState(false);

  useEffect(() => {
    if (feedback?.variant === "success") {
      setShowForm(false);
    }
  }, [feedback]);

  return (
    <section
      aria-label="Registros de glucosa"
      className="mt-10 border-t border-slate-200 pt-10 lg:mt-14 lg:pt-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Historial</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">Tus lecturas</h2>
        </div>
        <p className="dash-muted tabular-nums">
          {records.length}{" "}
          {records.length === 1 ? "registro" : "registros"}
          <span className="mx-2 text-emerald-200">·</span>
          <span className="text-emerald-800/70">{form.dateRange}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            if (!showForm) setShowIntervals(false);
          }}
          className={`group flex flex-1 items-center justify-center gap-2 px-5 py-3.5 text-sm font-light sm:py-4 ${
            showForm ? "dash-btn-outline-active" : "dash-btn-outline"
          }`}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              Cerrar formulario
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={1.25} aria-hidden />
              Nuevo registro
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowIntervals((v) => !v);
            if (!showIntervals) setShowForm(false);
          }}
          className={`flex flex-1 items-center justify-center gap-2 px-5 py-3.5 text-sm font-light sm:max-w-xs sm:flex-none sm:py-4 ${
            showIntervals
              ? "dash-btn-outline-active"
              : "dash-btn-outline text-slate-600"
          }`}
        >
          <CalendarRange className="h-4 w-4" strokeWidth={1.25} aria-hidden />
          Intervalo · {form.dateRange}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showIntervals ? (
          <motion.div
            key="intervals"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-y border-slate-200 py-4">
              <p className="mb-3 dash-stat-label">Rango temporal</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {DATE_RANGE_OPTIONS.map((option) => {
                  const active = form.dateRange === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDateRangeChange(option)}
                      className={active ? "dash-pill dash-pill-active" : "dash-pill dash-pill-idle"}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mt-4"
          >
            <GlucoseForm
              form={form}
              dispatch={dispatch}
              submitting={submitting}
              feedback={feedback}
              fetchError={fetchError}
              handleSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {feedback && !showForm ? (
        <p
          className={`mt-4 text-sm font-light ${
            feedback.variant === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <GlucoseTable
        records={records}
        fetchingRecords={fetchingRecords}
        className="mt-6 lg:mt-8"
      />
    </section>
  );
}
