"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Type } from "lucide-react";
import { useTextPreferences } from "@/hooks/useTextPreferences";
import type { AppTheme, TextContrast, TextSize } from "@/lib/accessibility/textPreferences";

const SIZE_OPTIONS: { id: TextSize; label: string; hint: string }[] = [
  { id: "comfortable", label: "Cómodo", hint: "Recomendado" },
  { id: "large", label: "Grande", hint: "+2 px" },
  { id: "xlarge", label: "Muy grande", hint: "+4 px" },
];

const CONTRAST_OPTIONS: { id: TextContrast; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "strong", label: "Fuerte" },
];

const THEME_OPTIONS: { id: AppTheme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
];

interface TextPreferencesControlProps {
  variant?: "popover" | "inline";
  className?: string;
}

function OptionButton({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
        active
          ? "border-emerald-500 bg-emerald-600 font-semibold text-white shadow-sm dark:border-emerald-400 dark:bg-emerald-600 dark:text-white"
          : "border-slate-200 bg-white font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-emerald-500 dark:hover:bg-slate-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function PanelContent() {
  const { prefs, setSize, setContrast, setTheme } = useTextPreferences();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Tema
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <OptionButton
                key={opt.id}
                active={prefs.theme === opt.id}
                onClick={() => setTheme(opt.id)}
                className="flex items-center justify-center gap-2"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {opt.label}
              </OptionButton>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Tamaño de letra
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.id}
              active={prefs.size === opt.id}
              onClick={() => setSize(opt.id)}
              className="flex flex-col items-center gap-0.5 py-3"
            >
              <span>{opt.label}</span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                {opt.hint}
              </span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Contraste / dureza
        </p>
        <p className="mt-1 text-xs font-light text-slate-500 dark:text-slate-400">
          “Fuerte” oscurece el texto para leer con más claridad.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {CONTRAST_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.id}
              active={prefs.contrast === opt.id}
              onClick={() => setContrast(opt.id)}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TextPreferencesControl({
  variant = "popover",
  className = "",
}: TextPreferencesControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "popover" || !open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  if (variant === "inline") {
    return (
      <div
        className={`rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60 ${className}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Type className="h-4 w-4 text-vitality-primary" strokeWidth={1.75} />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Ajuste de lectura
          </p>
        </div>
        <PanelContent />
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Ajustar tema, tamaño y contraste del texto"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-vitality-secondary bg-white text-vitality-neutral shadow-sm transition-colors hover:border-vitality-primary/30 hover:bg-vitality-secondary/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-emerald-600 dark:hover:bg-slate-700 lg:h-11 lg:w-11"
      >
        <Type className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Ajuste de lectura"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(calc(100vw-2rem),18rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-slate-600 dark:bg-slate-900 dark:shadow-black/30"
        >
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Ajuste de lectura
          </p>
          <PanelContent />
        </div>
      ) : null}
    </div>
  );
}
