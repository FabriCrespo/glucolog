"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import type { GlucoseRecord } from "@/types/glucose";

type FetchStatus = "idle" | "loading" | "success" | "error";

export interface UseGlucoseRecordsResult {
  records: GlucoseRecord[];
  status: FetchStatus;
  isFetching: boolean;
  error: string | null;
  /** Vuelve a pedir el mismo rango de días (p. ej. tras registrar). */
  refetch: () => Promise<void>;
}

/**
 * Carga registros de glucosa para un usuario y ventana de días.
 * Cancela actualizaciones de estado si el efecto se limpia (evita fugas al cambiar de ruta).
 */
export function useGlucoseRecords(
  userId: string | undefined,
  days: number
): UseGlucoseRecordsResult {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!userId || days < 1) {
      if (mounted.current) {
        setRecords([]);
        setStatus("idle");
        setError(null);
      }
      return;
    }

    if (mounted.current) {
      setStatus("loading");
      setError(null);
    }

    try {
      const data = await fetchGlucoseRecords(userId, days);
      if (!mounted.current) return;
      setRecords(data);
      setStatus("success");
    } catch (e) {
      console.error("[useGlucoseRecords]", e);
      if (!mounted.current) return;
      setRecords([]);
      setStatus("error");
      setError("Error al cargar los registros");
    }
  }, [userId, days]);

  useEffect(() => {
    void load();
  }, [load]);

  const refetch = useCallback(async () => {
    await load();
  }, [load]);

  return {
    records,
    status,
    isFetching: status === "loading",
    error,
    refetch,
  };
}
