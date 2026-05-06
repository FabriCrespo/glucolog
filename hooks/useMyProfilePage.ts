"use client";

import type { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { sendEmailVerification } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { auth } from "@/app/firebase/config";
import {
  type UserData,
  getUserData,
  updateUserData,
  uploadProfilePhoto,
} from "@/services/userService";

export interface VerificationFeedback {
  tone: "success" | "error";
  message: string;
}

export interface UseMyProfilePageResult {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  loading: boolean;
  loadError: string | null;
  isVerified: boolean;
  previewURL: string | null;
  /** Hay una imagen nueva seleccionada aún no subida a Firebase. */
  pendingPhotoUpload: boolean;
  saving: boolean;
  verificationFeedback: VerificationFeedback | null;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResendVerification: () => Promise<void>;
  handleSaveData: () => Promise<boolean>;
  resendingVerification: boolean;
}

export function useMyProfilePage(
  sessionUser: User | null | undefined,
  authLoading: boolean
): UseMyProfilePageResult {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const blobPreviewRef = useRef<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [verificationFeedback, setVerificationFeedback] =
    useState<VerificationFeedback | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  const compressProfileImage = useCallback(
    async (file: File): Promise<File> => {
      if (!file.type.startsWith("image/")) {
        throw new Error("Selecciona una imagen valida para tu foto de perfil.");
      }

      const imageDataURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () =>
          reject(new Error("No se pudo leer la imagen seleccionada."));
        reader.readAsDataURL(file);
      });

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(new Error("No se pudo procesar la imagen seleccionada."));
        img.src = imageDataURL;
      });

      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo preparar la compresion de la imagen.");
      }

      ctx.drawImage(image, 0, 0, width, height);

      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo comprimir la imagen."));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.78
        );
      });

      return new File([compressedBlob], "profile.jpg", { type: "image/jpeg" });
    },
    []
  );

  const revokeBlobIfNeeded = useCallback(() => {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokeBlobIfNeeded();
  }, [revokeBlobIfNeeded]);

  useEffect(() => {
    if (authLoading || !sessionUser) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        await sessionUser.reload();
        if (cancelled) return;
        setIsVerified(sessionUser.emailVerified);

        const data = await getUserData(sessionUser.uid);
        if (cancelled) return;

        if (data) {
          const merged: UserData = { ...data, uid: sessionUser.uid };
          setUserData(merged);
          revokeBlobIfNeeded();
          setPhotoFile(null);
          setPreviewURL(merged.photoURL ?? null);
        } else {
          setUserData(null);
        }
      } catch (e) {
        console.error("[useMyProfilePage] load", e);
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "No se pudo cargar el perfil."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, sessionUser, revokeBlobIfNeeded]);

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 8 * 1024 * 1024) {
        toast.error("La imagen es demasiado pesada", {
          description: "Selecciona una imagen menor a 8 MB.",
        });
        e.target.value = "";
        return;
      }

      try {
        const optimizedFile = await compressProfileImage(file);
        revokeBlobIfNeeded();
        setPhotoFile(optimizedFile);
        const url = URL.createObjectURL(optimizedFile);
        blobPreviewRef.current = url;
        setPreviewURL(url);
      } catch (error) {
        toast.error("No se pudo preparar la foto", {
          description:
            error instanceof Error
              ? error.message
              : "Intenta con otra imagen.",
        });
      } finally {
        e.target.value = "";
      }
    },
    [compressProfileImage, revokeBlobIfNeeded]
  );

  const handleResendVerification = useCallback(async () => {
    const user = auth.currentUser;
    if (!user || user.emailVerified) return;

    setResendingVerification(true);
    setVerificationFeedback(null);

    try {
      await sendEmailVerification(user);
      setVerificationFeedback({
        tone: "success",
        message:
          "Te enviamos un correo de verificación. Revisa tu bandeja (y spam).",
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/too-many-requests") {
          setVerificationFeedback({
            tone: "error",
            message:
              "Demasiados intentos. Espera unos minutos y vuelve a probar.",
          });
        } else {
          setVerificationFeedback({
            tone: "error",
            message: error.message || "No se pudo enviar el correo.",
          });
        }
      } else {
        setVerificationFeedback({
          tone: "error",
          message: "Error al enviar el correo. Inténtalo más tarde.",
        });
      }
    } finally {
      setResendingVerification(false);
    }
  }, []);

  const handleSaveData = useCallback(async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !userData) return false;

    const hadNewPhoto = !!photoFile;

    setSaving(true);

    try {
      let payload = userData;

      if (photoFile) {
        const photoURL = await uploadProfilePhoto(user, photoFile);
        payload = { ...userData, photoURL };
        setUserData(payload);
        revokeBlobIfNeeded();
        setPhotoFile(null);
        setPreviewURL(photoURL);
      }

      await updateUserData(user.uid, payload);

      if (hadNewPhoto) {
        toast.success("Foto y datos actualizados", {
          description:
            "Tu nueva foto de perfil ya está guardada y visible aquí.",
        });
      } else {
        toast.success("Perfil actualizado", {
          description: "Los cambios se guardaron en tu cuenta.",
        });
      }
      return true;
    } catch (e) {
      console.error("[useMyProfilePage] save", e);
      if (e instanceof FirebaseError && e.code === "storage/quota-exceeded") {
        toast.error("Bucket de Firebase Storage sin cuota", {
          description:
            "Se alcanzo el limite del plan actual. Libera espacio en Firebase Storage o habilita facturacion en Firebase para seguir subiendo fotos.",
        });
        return false;
      }
      toast.error("No se pudo guardar", {
        description: "Revisa tu conexión e inténtalo de nuevo.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [userData, photoFile, revokeBlobIfNeeded]);

  return {
    userData,
    setUserData,
    loading,
    loadError,
    isVerified,
    previewURL,
    pendingPhotoUpload: !!photoFile,
    saving,
    verificationFeedback,
    handlePhotoChange,
    handleResendVerification,
    handleSaveData,
    resendingVerification,
  };
}
