"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showWithGlycemicIndex: boolean;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmailVerified: boolean;
}

const SearchBar = ({
  searchTerm,
  handleSearch,
  showWithGlycemicIndex,
  handleCheckboxChange,
  isEmailVerified,
}: SearchBarProps) => {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Explorar</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">Buscar alimentos</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 ${
            isEmailVerified
              ? "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-700/60"
              : "bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-950/45 dark:text-amber-300 dark:ring-amber-700/60"
          }`}
        >
          {isEmailVerified ? "Activo" : "Verificar email"}
        </span>
      </div>

      <div className="mt-6">
        <label htmlFor="food-search" className="dash-input-label">
          Nombre del alimento
        </label>
        <div className="relative mt-2">
          <input
            id="food-search"
            type="text"
            placeholder="Ej. plátano, banana, arroz…"
            value={searchTerm}
            onChange={handleSearch}
            className="dash-input rounded-xl border border-slate-200/90 bg-gradient-to-r from-white to-emerald-50/20 py-3.5 pl-11 pr-11 transition-colors focus:border-vitality-primary dark:border-emerald-800/50 dark:from-emerald-950/70 dark:to-emerald-900/35 dark:focus:border-emerald-400 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:py-3 lg:pl-10 lg:pr-10 dark:lg:border-emerald-800/60 dark:lg:bg-transparent"
            disabled={!isEmailVerified}
          />
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center lg:w-10"
            aria-hidden
          >
            <Search
              className="h-4 w-4 text-emerald-600/70 dark:text-emerald-400/85"
              strokeWidth={1.5}
            />
          </span>
          {searchTerm ? (
            <button
              type="button"
              onClick={() =>
                handleSearch({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-vitality-primary dark:text-slate-400 dark:hover:text-emerald-400 lg:w-10 lg:rounded-none lg:bg-transparent"
              aria-label="Limpiar búsqueda"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 lg:rounded-none lg:bg-transparent lg:dark:bg-transparent lg:dark:hover:bg-transparent">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </button>
          ) : null}
        </div>
        {!isEmailVerified && (
          <p className="dash-muted mt-2 text-amber-700 dark:text-amber-300">
            Verifica tu email para buscar alimentos
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!isEmailVerified}
          onClick={() =>
            handleCheckboxChange({
              target: { checked: !showWithGlycemicIndex },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          className={`dash-pill rounded-full px-4 py-2 text-xs font-light tracking-wide transition-all active:scale-[0.97] disabled:opacity-50 ${
            showWithGlycemicIndex ? "dash-pill-active shadow-sm shadow-emerald-900/15" : "dash-pill-idle"
          }`}
        >
          Solo con índice glucémico
        </button>
        {searchTerm ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-2 text-xs font-light text-sky-800 ring-1 ring-sky-200/80 dark:bg-sky-950/45 dark:text-sky-300 dark:ring-sky-700/60">
            Búsqueda inteligente: {searchTerm.trim()}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
