"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import {
  passwordResetRequestSchema,
  zodErrorMessage,
} from "@/lib/validations/auth";

/**
 * Restablecimiento vía Identity Toolkit (axios → `/api/auth/request-password-reset`).
 */
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
      await api.post("/auth/request-password-reset", parsed.data);
      return { ok: true as const };
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Error al enviar el correo";
      return { ok: false as const, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { requestReset, isLoading };
}
