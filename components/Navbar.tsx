"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { NAV_LINKS } from "@/constants";
import PublicImage from "@/components/PublicImage";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Sparkles } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

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

  return (
    <header className="sticky top-0 z-50 border-b border-vitality-secondary bg-white/75 shadow-[0_4px_30px_-12px_rgba(51,65,85,0.15)] backdrop-blur-xl">
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

        {/* Desktop: pill nav */}
        <ul className="hidden items-center gap-1 rounded-full border border-vitality-secondary bg-vitality-secondary/60 p-1 shadow-inner lg:flex">
          {NAV_LINKS.map((link) => {
            const active = linkIsActive(link.href);
            return (
              <li key={link.key}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(link.href)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white text-vitality-neutral shadow-sm ring-1 ring-vitality-primary/20"
                      : "text-vitality-neutral/75 hover:bg-white/80 hover:text-vitality-neutral"
                  }`}
                >
                  {link.label.trim()}
                </button>
              </li>
            );
          })}
        </ul>

        {/* CTA desktop */}
        <div className="hidden items-center gap-3 lg:flex">
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

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-vitality-secondary bg-white text-vitality-neutral shadow-sm transition-colors hover:bg-vitality-secondary lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? (
            <X className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={2} />
          )}
        </button>
      </nav>

      {/* Mobile overlay + panel */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-vitality-neutral/40 backdrop-blur-sm lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-4 top-[4.75rem] z-[60] max-h-[min(85vh,560px)] overflow-y-auto rounded-2xl border border-vitality-secondary bg-white p-4 shadow-2xl lg:hidden">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-vitality-neutral/50">
              Menú
            </p>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = linkIsActive(link.href);
                return (
                  <li key={link.key}>
                    <button
                      type="button"
                      onClick={() => handleLinkClick(link.href)}
                      className={`flex w-full items-center rounded-xl px-4 py-3.5 text-left text-base font-medium transition-colors ${
                        active
                          ? "bg-vitality-secondary text-vitality-neutral ring-1 ring-vitality-primary/25"
                          : "text-vitality-neutral/85 hover:bg-vitality-secondary/70"
                      }`}
                    >
                      {link.label.trim()}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-vitality-secondary pt-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-vitality-secondary bg-white py-3.5 text-sm font-semibold text-vitality-neutral"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-vitality-primary py-3.5 text-sm font-semibold text-white shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
