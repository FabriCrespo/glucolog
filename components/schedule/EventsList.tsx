"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills,
  faDumbbell,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import type { Event } from "@/types/events";
import ScheduleModalShell from "@/components/schedule/ScheduleModalShell";

interface EventsListProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: import("dayjs").Dayjs | null;
  selectedDayEvents: Event[];
  handleAddNewEvent: () => void;
  getEventStatusText: (event: Event) => string;
  setSelectedEvent: (event: Event) => void;
}

function statusBadgeClass(statusText: string): string {
  if (statusText === "Completado") {
    return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80";
  }
  if (statusText === "Vencido") {
    return "bg-red-100 text-red-900 ring-1 ring-red-200/80";
  }
  return "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80";
}

const EventsList: React.FC<EventsListProps> = ({
  isVisible,
  onClose,
  selectedDate,
  selectedDayEvents,
  handleAddNewEvent,
  getEventStatusText,
  setSelectedEvent,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <ScheduleModalShell
          key="events-list"
          onClose={onClose}
          stackOrder={56}
          maxWidthClass="max-w-[520px]"
        >
          <div className="flex max-h-[min(90vh,720px)] flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800/90">
                  Día seleccionado
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedDate?.format("DD/MM/YYYY")}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedDayEvents.length}{" "}
                  {selectedDayEvents.length === 1 ? "evento" : "eventos"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <button
                type="button"
                onClick={handleAddNewEvent}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-vitality-primary py-3.5 text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-vitality-primary-dark"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Agregar evento
              </button>

              {selectedDayEvents.length > 0 ? (
                <ul className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const statusText = getEventStatusText(event);
                    return (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            requestAnimationFrame(() =>
                              setSelectedEvent(event)
                            );
                          }}
                          className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm"
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              event.type === "medication"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                event.type === "medication"
                                  ? faPills
                                  : faDumbbell
                              }
                              className="text-lg"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {event.title}
                            </p>
                            <p className="text-sm text-slate-500">{event.time}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(statusText)}`}
                          >
                            {statusText}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
                  <p className="font-medium text-slate-700">
                    No hay eventos este día
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pulsa “Agregar evento” para crear uno.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScheduleModalShell>
      )}
    </AnimatePresence>
  );
};

export default EventsList;
