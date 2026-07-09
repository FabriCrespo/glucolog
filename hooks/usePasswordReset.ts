"use client";

import { useState, useCallback } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { getPasswordResetSettings } from "@/lib/auth/action-code-settings";
import { mapPasswordResetError } from "@/lib/auth/firebase-auth-errors";
import {
  passwordResetRequestSchema,
  zodErrorMessage,
} from "@/lib/validations/auth";

/** Restablecimiento vía Firebase Auth (gratis, compatible con GitHub Pages). */
export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);

  const requestReset = useCallback(async (email: string) => {
    const parsed = passwordResetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      return {
        ok: false as const,
        error: zodErrorMessage(parsed.error),
      };
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(
        auth,
        parsed.data.email,
        getPasswordResetSettings()
      );
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: mapPasswordResetError(e) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { requestReset, isLoading };
}
