/** Clases compartidas login / signup — incluye modo oscuro */

export const authPageSection =
  "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-vitality-secondary via-[#eef6f3] to-vitality-secondary px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:py-14";

export const authDecorSvg =
  "pointer-events-none absolute text-vitality-primary/15 dark:text-emerald-500/20";

export const authCard =
  "rounded-2xl bg-white p-6 shadow-md ring-1 ring-vitality-secondary dark:bg-slate-800 dark:shadow-xl dark:shadow-black/25 dark:ring-slate-600 sm:p-8";

export const authCardInner = "rounded-2xl bg-white p-8 shadow-md ring-1 ring-vitality-secondary dark:bg-slate-800 dark:shadow-xl dark:shadow-black/25 dark:ring-slate-600";

export const authLogoWrap =
  "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-slate-700 dark:ring-slate-600";

export const authTitle =
  "text-2xl font-bold tracking-tight text-vitality-neutral dark:text-slate-50 md:text-[1.65rem]";

export const authSubtitle =
  "mt-2 max-w-sm text-sm leading-relaxed text-vitality-neutral/65 dark:max-w-md dark:text-slate-400";

export const authLabel =
  "text-sm font-medium text-vitality-neutral dark:text-slate-200";

export const authLabelBlock = "mb-1.5 block text-sm font-medium text-vitality-neutral dark:text-slate-200";

export const authInput =
  "block w-full rounded-xl border border-gray-200 bg-vitality-secondary/50 py-3 text-vitality-neutral placeholder:text-gray-400 focus:border-vitality-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-vitality-primary/25 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900 dark:focus:ring-emerald-500/30";

/** Ancho fijo del slot izquierdo — debe coincidir con pl-11 del input */
export const authInputWithIcon = `${authInput} pl-11 pr-3`;

export const authInputPassword = `${authInput} pl-11 pr-11`;

export const authInputPadding = `${authInput} px-3`;

export const authInputWithToggle = `${authInput} pl-3 pr-11`;

export const authSelectChevronClasses =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")] dark:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")]";

export const authSelect = `${authInput} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 dark:[color-scheme:dark]`;

export const authFieldWrap = "relative";

export const authIconMuted =
  "pointer-events-none absolute inset-y-0 left-0 z-[1] flex w-11 items-center justify-center text-gray-400 dark:text-slate-500";

export const authTogglePassword =
  "absolute inset-y-0 right-0 z-[1] flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300";

export const authLink =
  "text-sm font-medium text-vitality-tertiary transition-colors hover:text-vitality-primary-dark hover:underline disabled:opacity-50 dark:text-emerald-400 dark:hover:text-emerald-300";

export const authLinkInline =
  "font-medium text-vitality-tertiary transition-colors hover:text-vitality-primary-dark hover:underline dark:text-emerald-400 dark:hover:text-emerald-300";

export const authError =
  "rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100 dark:bg-red-950/45 dark:text-red-300 dark:ring-red-800/60";

export const authSuccess =
  "rounded-xl bg-vitality-secondary p-3 text-sm text-vitality-neutral ring-1 ring-vitality-tertiary/25 dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-emerald-700/50";

export const authDividerLine = "h-px flex-1 bg-gray-200 dark:bg-slate-600";

export const authDividerText =
  "text-xs font-medium uppercase tracking-wide text-vitality-neutral/45 dark:text-slate-500";

export const authFooterBorder = "mt-8 border-t border-gray-200 pt-6 dark:border-slate-600";

export const authFooterText =
  "text-center text-sm text-vitality-neutral/80 dark:text-slate-400";

export const authHint =
  "text-xs leading-relaxed text-vitality-neutral/55 dark:text-slate-500";

export const authSubmitBtn = (loading: boolean) =>
  `w-full rounded-xl py-3 text-center text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-vitality-primary/45 focus:ring-offset-2 dark:focus:ring-emerald-500/40 dark:focus:ring-offset-slate-800 ${
    loading
      ? "cursor-not-allowed bg-gray-400 dark:bg-slate-600"
      : "bg-vitality-primary hover:bg-vitality-primary-dark active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
  }`;

export const authTrustBadge =
  "flex h-11 w-11 items-center justify-center rounded-full bg-vitality-secondary text-vitality-primary ring-1 ring-vitality-tertiary/30 dark:bg-slate-800 dark:text-emerald-400 dark:ring-emerald-700/40";

export const authTrustCaption =
  "text-center text-[10px] font-medium uppercase tracking-[0.2em] text-vitality-neutral/45 dark:text-slate-500";
