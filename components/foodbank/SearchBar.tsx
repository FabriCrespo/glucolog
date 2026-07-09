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
          className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
            isEmailVerified
              ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
              : "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80"
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
            placeholder="Ej. arroz, manzana, pollo…"
            value={searchTerm}
            onChange={handleSearch}
            className="dash-input rounded-xl border border-slate-200/90 bg-gradient-to-r from-white to-emerald-50/20 py-3.5 pl-11 pr-11 transition-colors focus:border-vitality-primary lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:py-3 lg:pl-10 lg:pr-10"
            disabled={!isEmailVerified}
          />
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600/70 lg:left-0"
            strokeWidth={1.5}
            aria-hidden
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() =>
                handleSearch({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-emerald-100 hover:text-vitality-primary lg:right-0 lg:rounded-none lg:bg-transparent"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        {!isEmailVerified && (
          <p className="dash-muted mt-2 text-amber-700">
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
          className={`rounded-full px-4 py-2 text-xs font-light tracking-wide transition-all active:scale-[0.97] disabled:opacity-50 ${
            showWithGlycemicIndex
              ? "bg-vitality-primary text-white shadow-sm shadow-emerald-900/15"
              : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50"
          }`}
        >
          Solo con índice glucémico
        </button>
        {searchTerm ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-2 text-xs font-light text-sky-800 ring-1 ring-sky-200/80">
            Buscando: {searchTerm.trim()}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
