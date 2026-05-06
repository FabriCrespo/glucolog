import type { DateRangeLabel } from "@/types/dashboard-glucose";

export const DATE_RANGE_OPTIONS: readonly DateRangeLabel[] = [
  "7 días",
  "1 mes",
  "3 meses",
  "1 año",
] as const;

const DAYS_BY_LABEL: Record<DateRangeLabel, number> = {
  "7 días": 7,
  "1 mes": 30,
  "3 meses": 90,
  "1 año": 365,
};

export function daysFromDateRangeLabel(label: DateRangeLabel): number {
  return DAYS_BY_LABEL[label];
}

export function isDateRangeLabel(value: string): value is DateRangeLabel {
  return Object.prototype.hasOwnProperty.call(DAYS_BY_LABEL, value);
}
