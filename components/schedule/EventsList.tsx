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

function statusClass(statusText: string): string {
  if (statusText === "Completado") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (statusText === "Vencido") return "text-red-700 bg-red-50 border-red-200";
  return "text-sky-700 bg-sky-50 border-sky-200";
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
          fullScreenMobile
        >
          <div className="flex min-h-full flex-col lg:max-h-[min(90vh,720px)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-sky-50/30 px-5 py-5 sm:px-6">
              <div>
                <p className="dash-eyebrow">Día seleccionado</p>
                <h3 className="dash-title mt-1 text-xl">
                  {selectedDate?.format("DD/MM/YYYY")}
                </h3>
                <p className="dash-muted mt-1 tabular-nums">
                  {selectedDayEvents.length}{" "}
                  {selectedDayEvents.length === 1 ? "evento" : "eventos"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 transition-colors hover:text-vitality-primary"
                aria-label="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <button
                type="button"
                onClick={handleAddNewEvent}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-vitality-primary py-3.5 text-sm font-medium text-white shadow-md shadow-vitality-primary/20 transition-all active:scale-[0.98] hover:bg-vitality-primary-dark"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Agregar evento
              </button>

              {selectedDayEvents.length > 0 ? (
                <ul className="space-y-2">
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
                          className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 text-left transition-all active:scale-[0.98] hover:border-emerald-300/70"
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              event.type === "medication"
                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
                                : "bg-sky-100 text-sky-700 ring-1 ring-sky-200/80"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                event.type === "medication"
                                  ? faPills
                                  : faDumbbell
                              }
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-light text-slate-900">
                              {event.title}
                            </p>
                            <p className="dash-muted">{event.time}</p>
                          </div>
                          <span
                            className={`shrink-0 border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${statusClass(statusText)}`}
                          >
                            {statusText}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                  <p className="dash-title text-base text-slate-700">
                    No hay eventos este día
                  </p>
                  <p className="dash-body mt-2">
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
