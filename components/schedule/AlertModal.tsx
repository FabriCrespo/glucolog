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
            <p className="dash-eyebrow text-amber-800">Aviso</p>
            <h3 className="dash-title mt-2 text-lg">{title}</h3>
            <p className="dash-body mt-3">{message}</p>
            <button
              type="button"
              onClick={onClose}
              className="dash-btn-outline-active mt-6 w-full py-3 text-sm font-light sm:w-auto sm:px-10"
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
