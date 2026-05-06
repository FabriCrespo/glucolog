import dayjs from "dayjs";
import type { Event } from "@/types/events";

/** Clases Tailwind para chips / bordes según estado del evento. */
export function getEventStatusColor(event: Event): string {
  if (event.completed) {
    return "bg-emerald-50 border-emerald-200 text-emerald-900";
  }
  const eventDate = dayjs(event.date);
  const today = dayjs();
  if (eventDate.isBefore(today, "day")) {
    return "bg-red-50 border-red-200 text-red-900";
  }
  return "bg-sky-50 border-sky-200 text-sky-900";
}

export function getEventStatusText(event: Event): string {
  if (event.completed) return "Completado";
  const eventDate = dayjs(event.date);
  const today = dayjs();
  if (eventDate.isBefore(today, "day")) return "Vencido";
  return "Pendiente";
}
