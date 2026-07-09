"use client";

import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Pill,
  Plus,
  Sparkles,
} from "lucide-react";
import type { Event, MonthlyStatsType } from "@/types/events";

interface ScheduleMobileHubProps {
  getEventsForDay: (date: Dayjs) => Event[];
  handleDateClick: (date: Dayjs) => void;
  openNewEventForDate: (date: Dayjs) => void;
  onOpenCalendar: () => void;
  getEventStatusText: (event: Event) => string;
  setSelectedEvent: (event: Event) => void;
  monthlyStats: MonthlyStatsType;
}

const QUICK_PALETTE = [
  { gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-200/80" },
  { gradient: "from-sky-500 to-blue-600", ring: "ring-sky-200/80" },
  { gradient: "from-violet-500 to-purple-600", ring: "ring-violet-200/80" },
];

function statusPill(status: string) {
  if (status === "Completado") return "bg-emerald-100 text-emerald-800 ring-emerald-200/80";
  if (status === "Vencido") return "bg-red-100 text-red-800 ring-red-200/80";
  return "bg-sky-100 text-sky-800 ring-sky-200/80";
}

const ScheduleMobileHub = ({
  getEventsForDay,
  handleDateClick,
  openNewEventForDate,
  onOpenCalendar,
  getEventStatusText,
  setSelectedEvent,
  monthlyStats,
}: ScheduleMobileHubProps) => {
  const today = dayjs();
  const todayEvents = getEventsForDay(today);
  const pendingToday = todayEvents.filter((e) => !e.completed).length;

  const upcomingDays = Array.from({ length: 7 }, (_, i) => today.add(i, "day"));

  const previewEvents = todayEvents.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 px-5 py-5 ring-1 ring-emerald-200/50">
        <p className="text-sm font-medium text-slate-800">
          {today.format("dddd, D [de] MMMM")}
        </p>
        <p className="mt-1 text-sm font-light text-slate-600">
          {pendingToday > 0
            ? `Tienes ${pendingToday} ${pendingToday === 1 ? "pendiente" : "pendientes"} hoy.`
            : todayEvents.length > 0
              ? "¡Buen trabajo! Completaste todo lo de hoy."
              : "Sin eventos hoy. ¿Agregamos medicación o ejercicio?"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-3 text-center">
          <p className="text-xl font-semibold tabular-nums text-emerald-800">
            {monthlyStats?.completedMedications ?? 0}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700/80">
            Medicación
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-3 py-3 text-center">
          <p className="text-xl font-semibold tabular-nums text-sky-800">
            {monthlyStats?.completedExercises ?? 0}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-700/80">
            Ejercicio
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/60 px-3 py-3 text-center">
          <p className="text-xl font-semibold tabular-nums text-violet-800">
            {monthlyStats?.totalDuration ?? 0}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700/80">
            Min activos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenCalendar}
          className={`group overflow-hidden rounded-2xl text-left ring-1 transition-all active:scale-[0.97] ${QUICK_PALETTE[0].ring}`}
        >
          <div className={`bg-gradient-to-br ${QUICK_PALETTE[0].gradient} px-4 py-3 text-white`}>
            <CalendarDays className="h-5 w-5 opacity-90" strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-3">
            <span className="text-sm font-medium text-slate-800">Calendario</span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-0.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => openNewEventForDate(today)}
          className={`group overflow-hidden rounded-2xl text-left ring-1 transition-all active:scale-[0.97] ${QUICK_PALETTE[1].ring}`}
        >
          <div className={`bg-gradient-to-br ${QUICK_PALETTE[1].gradient} px-4 py-3 text-white`}>
            <Plus className="h-5 w-5 opacity-90" strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-3">
            <span className="text-sm font-medium text-slate-800">Nuevo hoy</span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="dash-stat-label">Próximos días</p>
            <p className="dash-muted mt-0.5">Desliza y toca un día</p>
          </div>
        </div>
        <ul className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {upcomingDays.map((day) => {
            const events = getEventsForDay(day);
            const hasPending = events.some((e) => !e.completed);
            const isToday = day.isSame(today, "day");
            return (
              <li key={day.format("YYYY-MM-DD")} className="shrink-0">
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`flex w-[4.25rem] flex-col items-center rounded-2xl border px-2 py-3 transition-all active:scale-[0.96] ${
                    isToday
                      ? "border-vitality-primary bg-emerald-50/70 shadow-sm shadow-emerald-900/5"
                      : "border-slate-200/90 bg-white hover:border-emerald-300/60"
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {day.format("ddd")}
                  </span>
                  <span
                    className={`mt-1 text-lg font-light tabular-nums ${
                      isToday ? "text-vitality-primary" : "text-slate-800"
                    }`}
                  >
                    {day.date()}
                  </span>
                  <span className="mt-2 flex h-1.5 gap-0.5">
                    {events.length === 0 ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    ) : (
                      <>
                        {events.slice(0, 3).map((ev, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${
                              ev.completed
                                ? "bg-emerald-500"
                                : ev.type === "medication"
                                  ? "bg-emerald-400"
                                  : "bg-sky-500"
                            }`}
                          />
                        ))}
                      </>
                    )}
                  </span>
                  {hasPending ? (
                    <span className="mt-1 text-[9px] font-medium text-amber-700">
                      pendiente
                    </span>
                  ) : events.length > 0 ? (
                    <span className="mt-1 text-[9px] font-medium text-emerald-700">
                      listo
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="dash-stat-label">Agenda de hoy</p>
          {todayEvents.length > 4 ? (
            <button
              type="button"
              onClick={() => handleDateClick(today)}
              className="text-xs font-light text-vitality-primary"
            >
              Ver todos ({todayEvents.length})
            </button>
          ) : null}
        </div>

        {previewEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-emerald-500/70" strokeWidth={1.5} />
            <p className="dash-title mt-3 text-base text-slate-700">Día libre</p>
            <p className="dash-body mt-1">Crea tu primer recordatorio del día.</p>
            <button
              type="button"
              onClick={() => openNewEventForDate(today)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-vitality-primary px-4 py-2 text-sm font-medium text-white shadow-sm active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Agregar evento
            </button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {previewEvents.map((event) => {
              const status = getEventStatusText(event);
              const Icon = event.type === "medication" ? Pill : Dumbbell;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-left transition-all active:scale-[0.98] hover:border-emerald-300/60"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        event.type === "medication"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {event.title}
                      </span>
                      <span className="dash-muted mt-0.5 block">{event.time}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ring-1 ${statusPill(status)}`}
                    >
                      {status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default ScheduleMobileHub;
