"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useMyProfilePage } from "@/hooks/useMyProfilePage";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileContent from "@/components/profile/ProfileContent";
import EmailVerificationGate from "@/components/profile/EmailVerificationGate";

export default function MyProfilePage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();
  const profile = useMyProfilePage(sessionUser, authLoading);

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [authLoading, sessionUser, router]);

  if (authLoading || !sessionUser || profile.loading) {
    return <LoadingSpinner />;
  }

  if (profile.loadError) {
    return (
      <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-12">
        <div className="max-container padding-container">
          <div className="rounded-2xl border border-red-200/90 bg-white p-8 text-center shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]">
            <p className="font-medium text-red-700">{profile.loadError}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!profile.userData) {
    return (
      <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-12">
        <div className="max-container padding-container">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]">
            <p className="text-[15px] text-slate-600">
              No hay datos de perfil guardados. Completa el registro o contacta
              soporte si el problema continúa.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!profile.isVerified) {
    return (
      <EmailVerificationGate
        firstName={profile.userData.firstName}
        onResend={profile.handleResendVerification}
        feedback={profile.verificationFeedback}
        resending={profile.resendingVerification}
      />
    );
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-8 sm:py-10 lg:py-12">
      <div className="max-container padding-container">
        <header className="mb-8 lg:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/90 sm:text-xs">
            Cuenta · Glucolog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Mi perfil
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Datos personales, salud y actividad en el mismo estilo que el panel
            principal.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] sm:p-6 lg:p-8">
          <ProfileContent
            userData={profile.userData}
            setUserData={profile.setUserData}
            previewURL={profile.previewURL}
            handlePhotoChange={profile.handlePhotoChange}
            handleSaveData={profile.handleSaveData}
            saving={profile.saving}
            pendingPhotoUpload={profile.pendingPhotoUpload}
          />
        </div>
      </div>
    </section>
  );
}
