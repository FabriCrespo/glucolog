import React from "react";
import Link from "next/link";
import PublicImage from "@/components/PublicImage";
import { NAV_LINKS } from "@/constants";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-vitality-primary text-white">
      <div className="max-container padding-container py-6 md:py-7">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <PublicImage
                src="/images/branding/LogoOG.png"
                alt="Glucolog"
                width={40}
                height={16}
                className="h-4 w-auto object-contain brightness-0 invert"
              />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">Glucolog</span>
              <span className="text-[11px] font-light text-white/75">
                Proyecto de grado
              </span>
            </span>
          </Link>

          <nav aria-label="Enlaces del sitio">
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-light text-white/90 sm:justify-end">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label.trim()}
                  </Link>
                </li>
              ))}
              <li className="hidden text-white/40 sm:inline" aria-hidden>
                ·
              </li>
              <li>
                <Link href="/login" className="font-medium transition-colors hover:text-white">
                  Entrar
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-4 border-t border-white/15 pt-4 text-center text-[11px] font-light leading-relaxed text-white/70 sm:text-left">
          © {year} Glucolog · App web para apoyar el control de la diabetes. Hecho como
          trabajo de titulación, sin ánimo comercial.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
