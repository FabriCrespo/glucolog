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
  my_profile: { icon: UserRound, shortLabel: "Perfil" },
};

const DESKTOP_LABEL: Record<string, string> = {
  home: "Inicio",
  dashboard: "Panel",
  food_bank: "Alimentos",
  Schedule: "Horarios",
  my_profile: "Perfil",
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden dark:bg-slate-950"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <PublicImage
                    src="/images/branding/LogoOG.png"
                    alt="Glucolog"
                    width={40}
                    height={16}
                    className="h-4 w-auto object-contain"
                  />
                  <span className="text-sm font-light tracking-wide text-slate-800 dark:text-slate-100">
                    Glucolog
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:text-vitality-primary dark:text-slate-400"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              {user ? (
                <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
                  <p className="dash-eyebrow">Sesión</p>
                  <p className="mt-2 truncate text-sm font-light text-slate-800 dark:text-slate-100">
                    {userLabel}
                  </p>
                </div>
              ) : null}

              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                          className={`relative flex w-full items-center gap-3 px-2 py-4 text-left transition-colors ${
                            active
                              ? "text-vitality-primary"
                              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                          }`}
                        >
                          {active ? (
                            <span
                              className="absolute inset-y-3 left-0 w-px bg-vitality-primary"
                              aria-hidden
                            />
                          ) : null}
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
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

              <div className="shrink-0 px-5 pb-3">
                <TextPreferencesControl variant="inline" />
              </div>

              <div className="shrink-0 border-t border-slate-200/90 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-slate-800">
                {user ? (
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="dash-btn-ghost inline-flex w-full items-center justify-center gap-2 py-2"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Cerrar sesión
                  </button>
                ) : (
                  <div className="space-y-3 text-center">
                    <p className="dash-body text-slate-500">
                      Inicia sesión para ver tu panel e informe.
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="dash-btn-ghost inline-flex items-center justify-center"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav className="max-container padding-container flex h-14 items-center justify-between md:h-16">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
          >
            <PublicImage
              src="/images/branding/LogoOG.png"
              alt="Glucolog"
              width={48}
              height={18}
              className="h-[18px] w-auto object-contain"
            />
            <span className="hidden flex-col sm:flex">
              <span className="text-sm font-light tracking-wide text-slate-900 dark:text-slate-50">
                Glucolog
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-800/70 dark:text-emerald-400/80">
                Diabetes
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = linkIsActive(link.href);
              const label = DESKTOP_LABEL[link.key] ?? link.label.trim();
              return (
                <li key={link.key}>
                  <button
                    type="button"
                    onClick={() => handleLinkClick(link.href)}
                    className={`relative pb-0.5 text-sm font-light tracking-wide transition-colors ${
                      active
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {label}
                    {active ? (
                      <span
                        className="absolute inset-x-0 -bottom-0.5 h-px bg-vitality-primary"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-5 lg:flex">
            <TextPreferencesControl />
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="dash-btn-ghost inline-flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                Salir
              </button>
            ) : (
              <Link href="/login" className="dash-btn-ghost">
                Iniciar sesión
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <TextPreferencesControl />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-slate-600 transition-colors hover:text-vitality-primary dark:text-slate-300"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
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
