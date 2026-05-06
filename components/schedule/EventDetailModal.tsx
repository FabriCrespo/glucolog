"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills,
  faDumbbell,
  faTimes,
  faCheck,
  faClock,
  faCalendarAlt,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import type { Event } from "@/types/events";
import { exerciseCompletionDurationSchema } from "@/lib/validation/scheduleForms";
import ScheduleModalShell from "@/components/schedule/ScheduleModalShell";

interface EventDetailModalProps {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  actualDuration: number;
  setActualDuration: (duration: number) => void;
  handleCompleteEvent: (event: Event) => void;
  getEventStatusText: (event: Event) => string;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  setSelectedEvent,
  actualDuration,
  setActualDuration,
  handleCompleteEvent,
  getEventStatusText,
}) => {
  const [notes, setNotes] = useState("");
  const [durationError, setDurationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      setNotes(selectedEvent.notes || "");
      setActualDuration(
        selectedEvent.actualDuration || selectedEvent.plannedDuration || 0
      );
      setDurationError(null);
    }
  }, [selectedEvent, setActualDuration]);

  const handleClose = () => {
    setSelectedEvent(null);
    setDurationError(null);
  };

  const handleComplete = () => {
    if (!selectedEvent) return;

    if (selectedEvent.type === "exercise") {
      const check = exerciseCompletionDurationSchema.safeParse(actualDuration);
      if (!check.success) {
        const msg =
          check.error.issues[0]?.message ?? "Duración no válida.";
        setDurationError(msg);
        return;
      }
    }

    setDurationError(null);
    const updatedEvent = {
      ...selectedEvent,
      notes,
      actualDuration:
        selectedEvent.type === "exercise" ? actualDuration : undefined,
    };
    handleCompleteEvent(updatedEvent);
  };

  return (
    <AnimatePresence mode="wait">
      {selectedEvent && (
        <ScheduleModalShell
          key={selectedEvent.id}
          onClose={handleClose}
          stackOrder={58}
          maxWidthClass="max-w-md"
        >
          <div className="flex max-h-[min(90vh,800px)] flex-col overflow-hidden">
            <div
              className={`shrink-0 border-b border-slate-100 p-5 sm:p-6 ${
                selectedEvent.type === "medication"
                  ? "bg-emerald-50/90"
                  : "bg-sky-50/90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                    <FontAwesomeIcon
                      icon={
                        selectedEvent.type === "medication"
                          ? faPills
                          : faDumbbell
                      }
                      className={`text-xl ${
                        selectedEvent.type === "medication"
                          ? "text-emerald-700"
                          : "text-sky-700"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900">
                      {selectedEvent.title}
                    </p>
                    <div
                      className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedEvent.completed
                          ? "bg-emerald-200/90 text-emerald-950"
                          : getEventStatusText(selectedEvent) === "Vencido"
                            ? "bg-red-100 text-red-900"
                            : "bg-amber-100 text-amber-950"
                      }`}
                    >
                      {selectedEvent.completed && (
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                      )}
                      {getEventStatusText(selectedEvent)}
                      {selectedEvent.completed && selectedEvent.completedAt && (
                        <span className="font-normal text-emerald-950/90">
                          ·{" "}
                          {dayjs(selectedEvent.completedAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-800"
                  aria-label="Cerrar"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="mt-0.5 text-vitality-primary"
                  />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </p>
                    <p className="font-semibold text-slate-900">
                      {dayjs(selectedEvent.date).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mt-0.5 text-vitality-primary"
                  />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Hora
                    </p>
                    <p className="font-semibold text-slate-900">
                      {selectedEvent.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4 rounded-2xl border border-slate-100 bg-white p-4 ring-1 ring-slate-50">
                {selectedEvent.type === "medication" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Tipo
                        </p>
                        <p className="font-medium capitalize text-slate-900">
                          {selectedEvent.medicationType || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Dosis
                        </p>
                        <p className="font-medium text-slate-900">
                          {selectedEvent.dose || "—"}
                        </p>
                      </div>
                    </div>
                    {selectedEvent.frequency ? (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Frecuencia
                        </p>
                        <p className="font-medium capitalize text-slate-900">
                          {selectedEvent.frequency}
                        </p>
                      </div>
                    ) : null}
                    {selectedEvent.instructions ? (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Instrucciones
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {selectedEvent.instructions}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Actividad
                        </p>
                        <p className="font-medium capitalize text-slate-900">
                          {selectedEvent.activityType || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Intensidad
                        </p>
                        <p className="font-medium capitalize text-slate-900">
                          {selectedEvent.intensity || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Duración planeada
                        </p>
                        <p className="font-medium text-slate-900">
                          {selectedEvent.plannedDuration ?? "—"} min
                        </p>
                      </div>
                      {selectedEvent.completed &&
                      selectedEvent.actualDuration != null ? (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Duración real
                          </p>
                          <p className="font-medium text-slate-900">
                            {selectedEvent.actualDuration} min
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FontAwesomeIcon
                    icon={faNoteSticky}
                    className="text-slate-400"
                  />
                  Notas
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25 disabled:bg-slate-50"
                  rows={3}
                  placeholder="Añade notas sobre este evento…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={selectedEvent.completed}
                />
              </div>

              {!selectedEvent.completed && (
                <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                  {selectedEvent.type === "exercise" && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-slate-400"
                        />
                        Duración real (minutos)
                      </label>
                      <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-slate-200">
                        <button
                          type="button"
                          className="bg-slate-100 px-4 py-3 text-lg font-medium text-slate-700 transition-colors hover:bg-slate-200"
                          onClick={() =>
                            setActualDuration(Math.max(5, actualDuration - 5))
                          }
                          aria-label="Menos 5 minutos"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="min-w-0 flex-1 border-x border-slate-200 py-3 text-center text-[15px] font-semibold text-slate-900 focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                          value={actualDuration}
                          onChange={(e) => {
                            setActualDuration(
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            );
                            setDurationError(null);
                          }}
                          min={5}
                        />
                        <button
                          type="button"
                          className="bg-slate-100 px-4 py-3 text-lg font-medium text-slate-700 transition-colors hover:bg-slate-200"
                          onClick={() =>
                            setActualDuration(actualDuration + 5)
                          }
                          aria-label="Más 5 minutos"
                        >
                          +
                        </button>
                      </div>
                      {durationError && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {durationError}
                        </p>
                      )}
                    </div>
                  )}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleComplete}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-vitality-primary py-3.5 text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-vitality-primary-dark"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Marcar como completado
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </ScheduleModalShell>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
