"use client";

import { useState, useCallback } from "react";
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { mapGoogleAuthError } from "@/lib/auth/firebase-auth-errors";

function splitDisplayName(displayName: string | null | undefined) {
  const parts = (displayName ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(auth, provider);
      const { user } = credential;
      const additional = getAdditionalUserInfo(credential);
      const userRef = doc(db, "users", user.uid);
      const existing = await getDoc(userRef);

      if (!existing.exists()) {
        const { firstName, lastName } = splitDisplayName(user.displayName);
        await setDoc(userRef, {
          firstName,
          lastName,
          email: user.email ?? "",
          gender: "",
          diabetesType: "",
          photoURL: user.photoURL ?? "",
          authProvider: "google",
          createdAt: new Date().toISOString(),
        });
      } else if (user.photoURL && !existing.data()?.photoURL) {
        await setDoc(
          userRef,
          { photoURL: user.photoURL, authProvider: "google" },
          { merge: true }
        );
      }

      return {
        ok: true as const,
        isNewUser: Boolean(additional?.isNewUser || !existing.exists()),
      };
    } catch (e) {
      return { ok: false as const, error: mapGoogleAuthError(e) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signInWithGoogle, isLoading };
}
