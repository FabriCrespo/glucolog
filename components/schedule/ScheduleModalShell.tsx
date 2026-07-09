"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface ScheduleModalShellProps {
  children: React.ReactNode;
  onClose: () => void;
  stackOrder?: number;
  overlayClassName?: string;
  maxWidthClass?: string;
  fullScreenMobile?: boolean;
}

export default function ScheduleModalShell({
  children,
  onClose,
  stackOrder = 55,
  overlayClassName = "",
  maxWidthClass = "max-w-[650px]",
  fullScreenMobile = false,
}: ScheduleModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="presentation"
      style={{ zIndex: stackOrder }}
      className={`fixed inset-0 flex bg-slate-900/40 backdrop-blur-[2px] ${
        fullScreenMobile
          ? "items-stretch justify-stretch p-0 lg:items-center lg:justify-center lg:p-4"
          : "items-center justify-center p-4"
      } ${overlayClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`animate-zoomIn w-full overflow-y-auto border border-slate-200/90 bg-white shadow-lg shadow-slate-900/10 ${
          fullScreenMobile
            ? "max-h-none min-h-full max-w-none rounded-none lg:max-h-[min(90vh,880px)] lg:max-w-[650px] lg:rounded-sm"
            : `max-h-[min(90vh,880px)] ${maxWidthClass}`
        }`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
