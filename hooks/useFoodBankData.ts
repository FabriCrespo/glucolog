"use client";

import type { User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { fetchFoodBankItems } from "@/services/foodBankService";
import type { FoodItem } from "@/types/food";

export interface UseFoodBankDataResult {
  foodData: FoodItem[];
  loading: boolean;
  error: string | null;
  emailVerified: boolean;
}

/**
 * Carga la tabla de alimentos y sincroniza el estado de verificación de email del usuario.
 */
export function useFoodBankData(
  user: User | null | undefined,
  authLoading: boolean
): UseFoodBankDataResult {
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      if (mounted.current && !authLoading && !user) {
        setFoodData([]);
        setLoading(false);
        setError(null);
      }
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        await user.reload();
        if (cancelled || !mounted.current) return;
        setEmailVerified(user.emailVerified);

        const items = await fetchFoodBankItems();
        if (cancelled || !mounted.current) return;
        setFoodData(items);
      } catch (err) {
        console.error("[useFoodBankData]", err);
        if (!cancelled && mounted.current) {
          setFoodData([]);
          setError(err instanceof Error ? err.message : "Error al cargar los datos");
        }
      } finally {
        if (!cancelled && mounted.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return {
    foodData,
    loading,
    error,
    emailVerified,
  };
}
