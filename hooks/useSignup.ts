"use client";

import { useState, useCallback } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { signupSchema, zodErrorMessage } from "@/lib/validations/auth";
import { mapSignupError } from "@/lib/auth/firebase-auth-errors";

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);

  const signup = useCallback(async (input: unknown) => {
    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: zodErrorMessage(parsed.error),
      };
    }

    const d = parsed.data;
    setIsLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        d.email,
        d.password
      );

      await setDoc(doc(db, "users", user.uid), {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        gender: d.gender,
        diabetesType: d.diabetesType,
        createdAt: new Date().toISOString(),
      });

      try {
        await sendEmailVerification(user);
      } catch (emailErr) {
        console.error("Error al enviar verificación:", emailErr);
      }

      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: mapSignupError(e) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signup, isLoading };
}
