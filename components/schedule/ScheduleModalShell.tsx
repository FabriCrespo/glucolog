"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface ScheduleModalShellProps {
  children: React.ReactNode;
  onClose: () => void;
  /** Capas: lista 56, nuevo 57, detalle 58, alerta 60. */
  stackOrder?: number;
  /** Clases extra en el overlay (sin z-index; usar `stackOrder`). */
  overlayClassName?: string;
  /** Max width: default schedule form width. */
  maxWidthClass?: string;
}

/**
 * Overlay + panel compartidos para modales de agenda (Escape, clic fuera, animación).
 */
export default function ScheduleModalShell({
  children,
  onClose,
  stackOrder = 55,
  overlayClassName = "",
  maxWidthClass = "max-w-[650px]",
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
      className={`fixed inset-0 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm ${overlayClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`max-h-[min(90vh,880px)] w-full ${maxWidthClass} overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20`}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
