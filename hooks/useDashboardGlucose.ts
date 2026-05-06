"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { Dispatch } from "react";
import { daysFromDateRangeLabel, isDateRangeLabel } from "@/constants/glucoseDashboard";
import {
  glucoseFormReducer,
  initialGlucoseFormState,
  type GlucoseFormAction,
} from "@/reducers/glucoseFormReducer";
import type { GlucoseFormSnapshot } from "@/types/dashboard-glucose";
import { useGlucoseChartBundle } from "@/hooks/useGlucoseChartBundle";
import { useGlucoseRecords } from "@/hooks/useGlucoseRecords";
import { useGlucoseRegistration } from "@/hooks/useGlucoseRegistration";

export interface UseDashboardGlucoseArgs {
  userId: string | undefined;
}

export interface UseDashboardGlucoseResult {
  form: GlucoseFormSnapshot;
  dispatch: Dispatch<GlucoseFormAction>;
  records: ReturnType<typeof useGlucoseRecords>["records"];
  fetchingRecords: boolean;
  fetchError: string | null;
  chartData: ReturnType<typeof useGlucoseChartBundle>["chartData"];
  chartOptions: ReturnType<typeof useGlucoseChartBundle>["chartOptions"];
  submitting: boolean;
  feedback: ReturnType<typeof useGlucoseRegistration>["feedback"];
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDateRangeChange: (range: string) => void;
}

/**
 * Estado del formulario (reducer) + datos remotos + gráficos derivados + mutación de registro.
 */
export function useDashboardGlucose({
  userId,
}: UseDashboardGlucoseArgs): UseDashboardGlucoseResult {
  const [form, dispatch] = useReducer(glucoseFormReducer, initialGlucoseFormState);

  const days = useMemo(
    () => daysFromDateRangeLabel(form.dateRange),
    [form.dateRange]
  );

  const { records, isFetching, error: fetchError, refetch } = useGlucoseRecords(
    userId,
    days
  );

  const { chartData, chartOptions } = useGlucoseChartBundle(records);

  const { submitForm, feedback, isPending } = useGlucoseRegistration({
    userId,
    onRegistered: refetch,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const ok = await submitForm(form);
      if (ok) {
        dispatch({ type: "RESET_AFTER_SUBMIT" });
      }
    },
    [form, submitForm]
  );

  const handleDateRangeChange = useCallback((range: string) => {
    if (!isDateRangeLabel(range)) return;
    dispatch({ type: "SET_DATE_RANGE", payload: range });
  }, []);

  return {
    form,
    dispatch,
    records,
    fetchingRecords: isFetching,
    fetchError,
    chartData,
    chartOptions,
    submitting: isPending,
    feedback,
    handleSubmit,
    handleDateRangeChange,
  };
}
