"use client";

import { useState, useEffect } from "react";
import PublicImage from "@/components/PublicImage";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  authCardInner,
  authDecorSvg,
  authDividerLine,
  authDividerText,
  authError,
  authFieldWrap,
  authFooterBorder,
  authFooterText,
  authIconMuted,
  authInputPassword,
  authInputWithIcon,
  authLabel,
  authLink,
  authLinkInline,
  authLogoWrap,
  authPageSection,
  authSubmitBtn,
  authSubtitle,
  authSuccess,
  authTitle,
  authTogglePassword,
  authTrustBadge,
  authTrustCaption,
} from "@/lib/auth/authFormStyles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading: loginLoading } = useLogin();
  const { requestReset, isLoading: resetLoading } = usePasswordReset();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const isLoading = loginLoading || resetLoading || googleLoading;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/myprofile");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const result = await login({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("¡Inicio de sesión exitoso!");
    setTimeout(() => {
      router.push("/myprofile");
    }, 500);
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);

    const result = await requestReset(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(
      "Se ha enviado un enlace para restablecer tu contraseña. Revisa tu correo."
    );
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);

    const result = await signInWithGoogle();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("¡Inicio de sesión con Google exitoso!");
    setTimeout(() => {
      router.push("/myprofile");
    }, 500);
  };

  return (
    <section className={authPageSection}>
      <svg
        className={`${authDecorSvg} right-0 top-0 h-40 w-48 md:h-52 md:w-64`}
        viewBox="0 0 200 160"
        fill="none"
        aria-hidden
      >
        <path
          d="M180 10 C 120 40, 80 80, 40 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={authLogoWrap}>
            <PublicImage
              src="/icons/food.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
            />
          </div>
          <h1 className={authTitle}>Bienvenido a Glucolog</h1>
          <p className={authSubtitle}>
            Tu asistente inteligente para el control de la diabetes
          </p>
        </div>

        <div className={authCardInner}>
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className={authLabel}>
                Correo Electrónico
              </label>
              <div className={authFieldWrap}>
                <input
                  id="email"
                  className={authInputWithIcon}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <span className={authIconMuted} aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className={authLabel}>
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className={authLink}
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className={authFieldWrap}>
                <input
                  id="password"
                  className={authInputPassword}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <span className={authIconMuted} aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <button
                  type="button"
                  className={authTogglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={authError}
              >
                {error}
              </motion.div>
            ) : null}

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={authSuccess}
              >
                {success}
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className={authSubmitBtn(loginLoading)}
            >
              {loginLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className={authDividerLine} />
            <span className={authDividerText}>o</span>
            <div className={authDividerLine} />
          </div>

          <GoogleSignInButton
            onClick={handleGoogleLogin}
            disabled={isLoading}
            isLoading={googleLoading}
            label="Continuar con Google"
          />

          <div className={authFooterBorder}>
            <p className={authFooterText}>
              ¿No tiene cuenta?{" "}
              <Link href="/signup" className={authLinkInline}>
                Regístrese aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={authTrustBadge}>
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className={authTrustBadge}>
              <BadgeCheck className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <p className={authTrustCaption}>Powered by Atmospheric Intelligence</p>
        </div>
      </motion.div>
    </section>
  );
}
