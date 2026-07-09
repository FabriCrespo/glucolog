"use client";

import type { VerificationFeedback } from "@/hooks/useMyProfilePage";

interface EmailVerificationGateProps {
  firstName: string;
  onResend: () => void | Promise<void>;
  feedback: VerificationFeedback | null;
  resending: boolean;
}

export default function EmailVerificationGate({
  firstName,
  onResend,
  feedback,
  resending,
}: EmailVerificationGateProps) {
  return (
    <section className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md border border-slate-200 p-8">
        <p className="dash-eyebrow text-center">Verificación · Glucolog</p>
        <h2 className="dash-title mt-3 text-center text-2xl">
          Hola, {firstName}
        </h2>
        <p className="dash-body mt-3 text-center">
          Confirma tu correo para ver tu informe de salud y usar todas las
          funciones de la app.
        </p>

        {feedback ? (
          <div
            role="status"
            className={`mt-5 border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <button
          type="button"
          disabled={resending}
          onClick={() => void onResend()}
          className="dash-btn-outline-active mt-6 w-full py-3.5 text-sm font-light disabled:opacity-60"
        >
          {resending ? "Enviando…" : "Reenviar correo de verificación"}
        </button>
      </div>
    </section>
  );
}
