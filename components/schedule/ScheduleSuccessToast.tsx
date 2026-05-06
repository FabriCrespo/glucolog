"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function ScheduleSuccessToast({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-0 right-0 z-[70] flex justify-center px-4"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
        >
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-emerald-200/90 bg-white px-5 py-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-slate-900">
              Cambio guardado correctamente
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
