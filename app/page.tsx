import Image from "next/image";
import {
  BellRing,
  BookmarkPlus,
  Droplets,
  Globe,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/Button";
import { FEATURES, type HomeFeatureIconId } from "@/constants";

const FEATURE_LUCIDE: Record<HomeFeatureIconId, LucideIcon> = {
  droplets: Droplets,
  utensils: UtensilsCrossed,
  bell: BellRing,
  sparkles: Sparkles,
};

type FeatureItemProps = {
  title: string;
  icon: HomeFeatureIconId;
  description: string;
};

const FeatureItem = ({ title, icon, description }: FeatureItemProps) => {
  const Icon = FEATURE_LUCIDE[icon];

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur-[2px] transition-shadow duration-200 hover:border-emerald-200/80 hover:shadow-md sm:p-7">
      <div className="relative shrink-0">
        <div
          className="pointer-events-none absolute -inset-0.5 rounded-[14px] bg-gradient-to-br from-emerald-400/25 via-emerald-300/10 to-transparent opacity-90 blur-[1px]"
          aria-hidden
        />
        <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-b from-white via-emerald-50/90 to-emerald-50/70 shadow-[0_6px_16px_-6px_rgba(15,118,110,0.22),inset_0_1px_0_rgba(255,255,255,0.98)] ring-1 ring-emerald-100/75 sm:h-14 sm:w-14">
          <Icon
            className="relative z-[1] h-8 w-8 text-vitality-primary sm:h-9 sm:w-9"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-slate-900 lg:text-xl">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{description}</p>
    </li>
  )
}

export default function Home() {
  return (
    <section>
      <section className="relative isolate min-h-screen overflow-hidden sm:min-h-[min(96vh,900px)] lg:min-h-[min(92vh,980px)]">
        <div className="hero-photo" aria-hidden />
        <div className="hero-photo-scrim" aria-hidden />

        <div className="max-container padding-container relative z-10 flex flex-col gap-16 py-12 pb-24 pt-12 sm:gap-20 sm:py-14 sm:pb-28 md:gap-24 lg:gap-28 lg:py-16 lg:pb-32 xl:flex-row xl:items-center xl:py-20">
      <div className="relative flex max-w-xl flex-1 flex-col xl:w-1/2">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800 shadow-sm backdrop-blur-sm sm:text-xs sm:tracking-[0.1em]">
          <span className="h-1.5 w-1.5 rounded-full bg-vitality-primary" aria-hidden />
          IA para tu metabolismo
        </span>

        <h1 className="text-[1.7rem] font-semibold leading-[1.18] tracking-[-0.03em] text-slate-900 sm:text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] lg:leading-[1.12]">
          Tu glucosa,{" "}
          <span className="bg-gradient-to-r from-vitality-primary to-emerald-600 bg-clip-text text-transparent">
            entendida por la IA
          </span>
        </h1>

        <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.65] text-slate-600 sm:text-base lg:mt-6">
          <strong className="font-semibold text-slate-800">Glucolog</strong> concentra registros,
          alimentación y hábitos en una sola experiencia. La inteligencia artificial detecta patrones,
          anticipa tendencias y te devuelve lecturas claras para que tomes decisiones con datos — no
          con conjeturas.
        </p>

        <p className="mt-4 text-sm font-medium text-slate-500">
          Empieza gratis. Sin tarjeta.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="button"
            title="Empezar gratis"
            icon="/icons/arrow-right.svg"
            iconEnd
            variant="btn_green"
            link="/signup"
          />
          <Button type="button" title="Iniciar sesión" variant="btn_white_text" link="/login" />
        </div>
        </div>

        </div>
      </section>
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="services-photo" aria-hidden />
      <div className="services-photo-scrim" aria-hidden />

      <div className="max-container padding-container relative z-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
          <div className="order-2 flex justify-center lg:order-1 lg:w-[min(100%,380px)] lg:shrink-0 xl:w-[400px]">
            <Image
              src="/images/devices/phone.png"
              alt="Vista de la app Glucolog en el móvil"
              width={440}
              height={1000}
              className="relative z-10 h-auto w-[min(100%,260px)] rotate-[11deg] drop-shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] sm:w-[min(100%,300px)] lg:sticky lg:top-28 lg:w-full lg:max-w-none"
              sizes="(max-width: 1023px) 260px, 380px"
              priority={false}
            />
          </div>

          <div className="order-1 min-w-0 flex-1 lg:order-2">
            <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800 shadow-sm backdrop-blur-sm sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-vitality-primary" aria-hidden />
              Tu día con datos claros
            </span>
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] xl:text-[2.25rem] xl:leading-tight">
              Herramientas para tu salud,{" "}
              <span className="text-vitality-primary">respaldadas por IA</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Registro, nutrición y predicciones en un solo lugar —               pensado para que gestionar tu glucosa sea simple, visible y accionable.
            </p>

            <ul className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2 md:gap-7 lg:mt-12 lg:gap-8">
              {FEATURES.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  title={feature.title}
                  icon={feature.icon}
                  description={feature.description}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section className="flexCenter w-full flex-col px-4 pb-20 pt-6 sm:pb-24 lg:pb-28">
      <div className="get-app">
        <div className="relative z-20 flex w-full max-w-xl flex-1 flex-col justify-center gap-8 md:max-w-none">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/95 backdrop-blur-sm sm:text-xs">
            Progressive Web App
          </span>

          <div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15] xl:max-w-[26rem]">
              Úsala en el navegador.
              <span className="mt-1 block text-emerald-300/95">Instálala como app cuando quieras.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-200/90 sm:text-base">
              Glucolog es una <strong className="font-semibold text-white">PWA</strong>: misma experiencia en móvil y
              escritorio, sin depender de tiendas. Entra desde Chrome, Safari o Edge y, si lo prefieres, añádela a tu
              pantalla de inicio en segundos.
            </p>
          </div>

          <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
            <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Globe className="h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-white">Sin tiendas</p>
                <p className="mt-1 text-xs leading-snug text-slate-300/90">Nada de descargas desde App Store o Play Store.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <BookmarkPlus className="h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-white">Como app nativa</p>
                <p className="mt-1 text-xs leading-snug text-slate-300/90">“Añadir a pantalla de inicio” desde el menú del navegador.</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <RefreshCw className="h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-white">Siempre actualizada</p>
                <p className="mt-1 text-xs leading-snug text-slate-300/90">Mejoras y correcciones al usar la web, sin instalar de nuevo.</p>
              </div>
            </li>
          </ul>

          <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
            <Button type="button" title="Empezar gratis" variant="btn_green" link="/signup" full />
            <Button type="button" title="Iniciar sesión" variant="btn_white_text" link="/login" full />
          </div>

          <p className="max-w-lg text-xs leading-relaxed text-slate-400/95 sm:text-sm">
            Consejo: en Android, menú de Chrome (tres puntos); en iPhone, Compartir y luego “Añadir a pantalla de inicio”.
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center md:justify-end">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_50%,rgba(45,212,191,0.12),transparent)]" aria-hidden />
          <Image
            src="/images/devices/phones.png"
            alt="Glucolog en móvil y escritorio"
            width={520}
            height={820}
            className="relative z-[1] h-auto w-[min(100%,280px)] drop-shadow-2xl sm:w-[min(100%,340px)] lg:w-[min(100%,400px)]"
            sizes="(max-width: 768px) 280px, 400px"
          />
        </div>
      </div>
    </section>
    </section>
  )
}
