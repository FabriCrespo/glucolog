"use client";

import { useCallback, useRef, useState } from "react";
import { registerGlucose } from "@/services/glucoseService";
import { upsertGlucoseFeatureRow } from "@/services/glucoseFeatureService";
import type { DashboardFormFeedback, GlucoseFormSnapshot } from "@/types/dashboard-glucose";
import { parseGlucoseLevel, validateGlucoseForm } from "@/lib/validation/glucoseForm";

const SUCCESS_MESSAGE = "Registro guardado correctamente";

export interface UseGlucoseRegistrationOptions {
  userId: string | undefined;
  onRegistered: () => Promise<void>;
}

export interface UseGlucoseRegistrationResult {
  isPending: boolean;
  feedback: DashboardFormFeedback | null;
  clearFeedback: () => void;
  /** Valida, persiste en Firestore y dispara onRegistered. Devuelve true si hubo éxito. */
  submitForm: (form: GlucoseFormSnapshot) => Promise<boolean>;
}

/**
 * Mutación para crear un registro de glucosa a partir del estado del formulario.
 */
export function useGlucoseRegistration({
  userId,
  onRegistered,
}: UseGlucoseRegistrationOptions): UseGlucoseRegistrationResult {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<DashboardFormFeedback | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedback = useCallback(() => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
    setFeedback(null);
  }, []);

  const submitForm = useCallback(
    async (form: GlucoseFormSnapshot): Promise<boolean> => {
      const validationError = validateGlucoseForm(form);
      if (validationError) {
        setFeedback({ variant: "error", message: validationError });
        return false;
      }

      if (!userId) {
        setFeedback({ variant: "error", message: "Debe iniciar sesión para registrar" });
        return false;
      }

      const level = parseGlucoseLevel(form.glucoseLevel);
      if (level === null) {
        setFeedback({ variant: "error", message: "Nivel de glucosa no válido" });
        return false;
      }

      if (successTimer.current) {
        clearTimeout(successTimer.current);
        successTimer.current = null;
      }
      setFeedback(null);
      setIsPending(true);

      try {
        const recordId = await registerGlucose(userId, {
          glucoseLevel: level,
          measurementContext: form.measurementContext,
          ateSomething: form.ateSomething,
          foodEaten: form.ateSomething ? form.foodEaten || undefined : undefined,
          foodMeal: form.ateSomething ? form.foodMeal || undefined : undefined,
          minutesSinceMeal:
            form.ateSomething && typeof form.minutesSinceMeal === "number"
              ? form.minutesSinceMeal
              : null,
          medicationTakenRecently: form.medicationTakenRecently,
          medicationType: form.medicationTakenRecently
            ? form.medicationType || undefined
            : undefined,
          activityLevelLastHours: form.activityLevelLastHours,
          stressLevel: form.stressLevel === "" ? null : form.stressLevel,
          notes: form.notes || undefined,
        });
        try {
          await upsertGlucoseFeatureRow(userId, recordId);
        } catch (featureError) {
          // No bloquea el flujo principal si falla la derivación de features.
          console.error("[useGlucoseRegistration] feature-row", featureError);
        }
        await onRegistered();

        setFeedback({ variant: "success", message: SUCCESS_MESSAGE });
        successTimer.current = setTimeout(() => {
          setFeedback(null);
          successTimer.current = null;
        }, 3000);

        return true;
      } catch (e) {
        console.error("[useGlucoseRegistration]", e);
        setFeedback({
          variant: "error",
          message: "Error al registrar. Intente nuevamente.",
        });
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [userId, onRegistered]
  );

  return {
    isPending,
    feedback,
    clearFeedback,
    submitForm,
  };
}
