"use client";

import { motion } from "framer-motion";
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
    <section className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/90">
          Verificación · Glucolog
        </p>
        <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Hola, {firstName}
        </h2>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-slate-600">
          Confirma tu correo para usar todas las funciones (tabla de alimentos,
          agenda y más).
        </p>

        {feedback && (
          <div
            role="status"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={resending}
          onClick={() => void onResend()}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-vitality-primary py-3.5 text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-vitality-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? "Enviando…" : "Reenviar correo de verificación"}
        </motion.button>
      </motion.div>
    </section>
  );
}
