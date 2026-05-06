"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import ScheduleModalShell from "@/components/schedule/ScheduleModalShell";

interface AlertModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isVisible,
  onClose,
  title,
  message,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <ScheduleModalShell
          key="alert"
          onClose={onClose}
          stackOrder={60}
          maxWidthClass="max-w-[400px]"
        >
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-vitality-primary py-3 text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-vitality-primary-dark sm:w-auto sm:px-10"
            >
              Entendido
            </button>
          </div>
        </ScheduleModalShell>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
