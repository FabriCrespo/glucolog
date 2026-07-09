import React from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import { Event } from "@/types/events";

interface CalendarGridProps {
  days: Dayjs[];
  currentDate: Dayjs;
  newEventDate: Dayjs | null;
  handleDateClick: (date: Dayjs) => void;
  getEventsForDay: (date: Dayjs) => Event[];
  handleEventClick: (event: Event, e: React.MouseEvent) => void;
  compact?: boolean;
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAYS_SHORT = ["D", "L", "M", "X", "J", "V", "S"];

function getDayStatus(events: Event[]) {
  if (events.length === 0) return null;
  if (events.some((event) => !event.completed)) return "pending";
  if (events.every((event) => event.completed)) return "completed";
  return null;
}

const CalendarGrid = ({
  days,
  currentDate,
  newEventDate,
  handleDateClick,
  getEventsForDay,
  handleEventClick,
  compact = false,
}: CalendarGridProps) => {
  const weekdayLabels = compact ? WEEKDAYS_SHORT : WEEKDAYS;

  return (
    <div
      className={`overflow-hidden border border-slate-200 ${
        compact ? "rounded-2xl shadow-sm shadow-slate-900/5" : ""
      }`}
    >
      <div
        className={`grid grid-cols-7 border-b border-slate-200 ${
          compact ? "bg-gradient-to-r from-emerald-50/80 to-sky-50/50" : "bg-slate-50/60"
        }`}
      >
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className={`text-center ${compact ? "py-2.5 text-[10px] font-medium uppercase tracking-wide text-slate-500" : "dash-stat-label py-3"}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((dayItem, index) => {
          const isToday = dayItem.isSame(dayjs(), "day");
          const isPast = dayItem.isBefore(dayjs(), "day");
          const eventsForDay = getEventsForDay(dayItem);
          const dayStatus = getDayStatus(eventsForDay);
          const isCurrentMonth = dayItem.isSame(currentDate, "month");
          const isSelected =
            newEventDate != null && dayItem.isSame(newEventDate, "day");

          return (
            <div
              key={index}
              onClick={() => handleDateClick(dayItem)}
              className={`schedule-day-cell relative flex cursor-pointer flex-col border-b border-r border-slate-100 transition-all active:scale-[0.98]
                ${compact ? "min-h-[72px] p-1.5 sm:min-h-[80px]" : "min-h-[108px] p-2 sm:min-h-[120px] sm:p-2.5"}
                ${isCurrentMonth ? "bg-white" : "bg-slate-50/50"}
                ${isSelected ? "ring-2 ring-inset ring-vitality-primary" : ""}
                ${isToday ? "bg-emerald-50/40" : ""}
                ${isPast && isCurrentMonth ? "opacity-75" : ""}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`font-light tabular-nums ${
                    compact ? "text-xs" : "text-sm"
                  } ${
                    isToday
                      ? compact
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-vitality-primary text-[11px] text-white"
                        : "flex h-7 w-7 items-center justify-center bg-vitality-primary text-white"
                      : isCurrentMonth
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {dayItem.date()}
                </span>
                {dayStatus ? (
                  <span
                    className={`rounded-full ${
                      compact ? "h-1.5 w-1.5" : "h-2 w-2"
                    } ${
                      dayStatus === "completed" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    title={
                      dayStatus === "completed" ? "Todo completado" : "Pendiente"
                    }
                  />
                ) : null}
              </div>

              {compact ? (
                <div className="mt-auto flex flex-wrap items-center justify-center gap-1 px-0.5 pb-0.5">
                  {eventsForDay.length === 0 ? null : eventsForDay.length > 3 ? (
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-medium text-violet-700">
                      +{eventsForDay.length}
                    </span>
                  ) : (
                    eventsForDay.slice(0, 3).map((event, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          event.completed
                            ? "bg-emerald-500"
                            : event.type === "medication"
                              ? "bg-emerald-400"
                              : "bg-sky-500"
                        }`}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                  {eventsForDay.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`schedule-event-pill flex cursor-pointer items-center gap-1 border px-1.5 py-1 text-[10px] font-light leading-tight sm:text-xs
                        ${
                          event.completed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : isPast
                              ? "border-red-200 bg-red-50 text-red-900"
                              : event.type === "medication"
                                ? "border-emerald-200/80 bg-white text-emerald-800"
                                : "border-sky-200/80 bg-white text-sky-800"
                        }`}
                    >
                      <FontAwesomeIcon
                        icon={event.type === "medication" ? faPills : faDumbbell}
                        className="shrink-0 text-[9px] opacity-70"
                      />
                      <span className="truncate">
                        {event.time} {event.title}
                      </span>
                    </div>
                  ))}

                  {eventsForDay.length > 3 ? (
                    <span className="dash-muted px-0.5">
                      +{eventsForDay.length - 3} más
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
