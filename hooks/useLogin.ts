"use client";

import { useState, useCallback } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { loginSchema, zodErrorMessage } from "@/lib/validations/auth";
import { mapLoginError } from "@/lib/auth/firebase-auth-errors";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (input: unknown) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: zodErrorMessage(parsed.error),
      };
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(
        auth,
        parsed.data.email,
        parsed.data.password
      );
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: mapLoginError(e) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading };
}
