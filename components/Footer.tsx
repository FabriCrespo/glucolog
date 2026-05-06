import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FOOTER_CONTACT_INFO, NAV_LINKS } from "@/constants";
import { Heart, Mail, Phone, Shield } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-vitality-secondary bg-gradient-to-b from-white via-vitality-secondary/40 to-vitality-secondary/70">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-vitality-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-vitality-tertiary/15 blur-3xl"
        aria-hidden
      />

      <div className="relative padding-container max-container py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-vitality-primary to-vitality-tertiary p-0.5 shadow-lg shadow-vitality-primary/20">
                <span className="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-white">
                  <Image
                    src="/images/branding/LogoOG.png"
                    alt="Glucolog"
                    width={48}
                    height={20}
                    className="h-5 w-auto object-contain"
                  />
                </span>
              </span>
              <span>
                <span className="block text-lg font-bold tracking-tight text-vitality-neutral">
                  Glucolog
                </span>
                <span className="text-sm text-vitality-neutral/65">
                  Tu compañero para una vida más saludable
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-vitality-neutral/70">
              Registro de glucosa, alimentación y recordatorios en un solo lugar.
              Diseñado para el día a día con diabetes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-vitality-neutral shadow-sm ring-1 ring-vitality-secondary">
                <Shield className="h-3.5 w-3.5 text-vitality-primary" />
                Datos seguros
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-vitality-neutral shadow-sm ring-1 ring-vitality-secondary">
                <Heart className="h-3.5 w-3.5 text-vitality-tertiary" />
                Hecho para ti
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-vitality-neutral/50">
              Enlaces
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-sm font-medium text-vitality-neutral/85 transition-colors hover:text-vitality-primary"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-vitality-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label.trim()}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="inline-flex text-sm font-semibold text-vitality-tertiary hover:text-vitality-primary-dark"
                >
                  Iniciar sesión →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact strip */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-vitality-neutral/50">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_CONTACT_INFO.links.map((item) => {
                const isEmail = item.value.includes("@");
                return (
                  <li
                    key={item.label}
                    className="flex items-start gap-2 text-sm text-vitality-neutral/75"
                  >
                    {isEmail ? (
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-vitality-primary" />
                    ) : (
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-vitality-primary" />
                    )}
                    <span>
                      <span className="block text-xs text-vitality-neutral/50">
                        {item.label}
                      </span>
                      {isEmail ? (
                        <a
                          href={`mailto:${item.value}`}
                          className="font-medium text-vitality-neutral hover:text-vitality-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <a
                          href={`tel:${item.value.replace(/\s/g, "")}`}
                          className="font-medium text-vitality-neutral hover:text-vitality-primary"
                        >
                          {item.value}
                        </a>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-vitality-secondary/80 pt-8 md:flex-row">
          <p className="text-center text-xs text-vitality-neutral/55 md:text-left">
            © {year} Glucolog. Todos los derechos reservados.
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-vitality-neutral/40">
            Vitality · intelligence · care
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
