"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { NAV_LINKS } from "@/constants";
import PublicImage from "@/components/PublicImage";
import TextPreferencesControl from "@/components/TextPreferencesControl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  Sparkles,
  Home,
  LayoutDashboard,
  Utensils,
  CalendarDays,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const MOBILE_NAV: Record<
  string,
  { icon: LucideIcon; shortLabel: string }
> = {
  home: { icon: Home, shortLabel: "Inicio" },
  dashboard: { icon: LayoutDashboard, shortLabel: "Panel" },
  food_bank: { icon: Utensils, shortLabel: "Alimentos" },
  Schedule: { icon: CalendarDays, shortLabel: "Horarios" },
  my_profile: { icon: UserRound, shortLabel: "Mi perfil" },
};

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLinkClick = (href: string) => {
    if (!user && href !== "/") {
      router.push("/login");
    } else {
      router.push(href);
    }
    setMenuOpen(false);
  };

  const linkIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userLabel =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const mobileMenu =
    mounted && menuOpen
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="mobile-menu"
              id="mobile-nav-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden dark:bg-slate-900"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200/90 px-4 py-3">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-vitality-primary to-vitality-tertiary p-0.5 shadow-sm shadow-vitality-primary/20">
                    <span className="flex h-full w-full items-center justify-center rounded-[0.65rem] bg-white">
                      <PublicImage
                        src="/images/branding/LogoOG.png"
                        alt="Glucolog"
                        width={48}
                        height={20}
                        className="h-5 w-auto object-contain"
                      />
                    </span>
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight text-slate-800">
                      Glucolog
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-vitality-primary">
                      Control inteligente
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-vitality-primary/30 hover:text-vitality-primary"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              {user ? (
                <div className="shrink-0 border-b border-slate-200/90 px-4 py-3">
                  <p className="dash-stat-label">Conectado como</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {userLabel}
                  </p>
                </div>
              ) : null}

              <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                <p className="dash-eyebrow px-3 pb-2 pt-1">Navegación</p>
                <ul>
                  {NAV_LINKS.map((link) => {
                    const active = linkIsActive(link.href);
                    const meta = MOBILE_NAV[link.key];
                    const Icon = meta?.icon ?? Home;
                    const label = meta?.shortLabel ?? link.label.trim();

                    return (
                      <li key={link.key}>
                        <button
                          type="button"
                          onClick={() => handleLinkClick(link.href)}
                          className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left transition-colors ${
                            active
                              ? "bg-emerald-50/80 text-vitality-primary"
                              : "text-slate-700 active:bg-slate-50"
                          }`}
                        >
                          {active ? (
                            <span
                              className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-vitality-primary"
                              aria-hidden
                            />
                          ) : null}
                          <Icon
                            className={`h-[18px] w-[18px] shrink-0 ${
                              active ? "text-vitality-primary" : "text-slate-400"
                            }`}
                            strokeWidth={1.5}
                          />
                          <span className="text-[15px] font-light tracking-wide">
                            {label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="shrink-0 px-4 pb-2">
                <TextPreferencesControl variant="inline" />
              </div>

              <div className="shrink-0 border-t border-slate-200/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {user ? (
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-vitality-primary/30 hover:bg-emerald-50/50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Cerrar sesión
                  </button>
                ) : (
                  <>
                    <p className="dash-body mb-3 text-center text-slate-500">
                      Inicia sesión para ver tu panel e informe de salud.
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-vitality-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-vitality-primary/25 transition-colors hover:bg-vitality-primary-dark"
                    >
                      <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-vitality-secondary bg-white/80 shadow-[0_4px_30px_-12px_rgba(51,65,85,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vitality-primary/40 to-transparent"
          aria-hidden
        />
        <nav className="max-container padding-container relative flex items-center justify-between py-3 md:py-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-vitality-primary to-vitality-tertiary p-0.5 shadow-md shadow-vitality-primary/25">
              <span className="flex h-full w-full items-center justify-center rounded-[0.85rem] bg-white">
                <PublicImage
                  src="/images/branding/LogoOG.png"
                  alt="Glucolog"
                  width={56}
                  height={22}
                  className="h-6 w-auto object-contain"
                />
              </span>
            </span>
            <span className="hidden flex-col sm:flex">
              <span className="text-sm font-bold leading-tight tracking-tight text-vitality-neutral">
                Glucolog
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-vitality-primary">
                Control inteligente
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 rounded-full border border-vitality-secondary bg-vitality-secondary/60 p-1 shadow-inner dark:border-slate-600 dark:bg-slate-800 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = linkIsActive(link.href);
              return (
                <li key={link.key}>
                  <button
                    type="button"
                    onClick={() => handleLinkClick(link.href)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-vitality-neutral shadow-sm ring-1 ring-vitality-primary/20 dark:bg-slate-700 dark:text-white dark:ring-emerald-500/50"
                        : "text-vitality-neutral/75 hover:bg-white/80 hover:text-vitality-neutral dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    }`}
                  >
                    {link.label.trim()}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <TextPreferencesControl />
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-vitality-secondary bg-white px-4 py-2.5 text-sm font-semibold text-vitality-neutral shadow-sm transition-all hover:border-vitality-primary/30 hover:bg-vitality-secondary/50"
              >
                <LogOut className="h-4 w-4 text-vitality-tertiary" aria-hidden />
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-vitality-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vitality-primary/30 transition-all hover:bg-vitality-primary-dark hover:shadow-xl hover:shadow-vitality-primary/35 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 opacity-90" aria-hidden />
                Iniciar sesión
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <TextPreferencesControl />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-vitality-secondary bg-white text-vitality-neutral shadow-sm transition-colors hover:bg-vitality-secondary"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </nav>
      </header>
      {mobileMenu}
    </>
  );
};

export default Navbar;
