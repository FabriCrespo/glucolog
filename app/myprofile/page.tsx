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
      <section className="profile-page">
        <div className="max-container px-4 py-4 md:padding-container md:py-12">
          <div className="border border-red-200/90 bg-red-50/30 px-6 py-8 text-center dark:border-red-800/60 dark:bg-red-950/40">
            <p className="dash-body text-red-700 dark:text-red-300">{profile.loadError}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!profile.userData) {
    return (
      <section className="profile-page">
        <div className="max-container px-4 py-4 md:padding-container md:py-12">
          <div className="profile-panel px-6 py-8 text-center">
            <p className="dash-body">
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
    <section className="profile-page">
      <div className="max-container px-4 py-4 md:padding-container md:py-12 lg:py-16">
        <header className="mb-8 border-b border-slate-200/90 pb-6 dark:border-emerald-800/45">
          <p className="dash-eyebrow">Salud · Glucolog</p>
          <h1 className="dash-title mt-2 text-2xl lg:text-3xl">
            Mi informe de diabetes
          </h1>
          <p className="dash-body mt-3 max-w-2xl">
            Un resumen diario de cómo va tu enfermedad según glucosa, comidas,
            actividad y datos clínicos que registras en la app.
          </p>
        </header>

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
    </section>
  );
}
