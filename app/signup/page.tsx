"use client";

import PublicImage from "@/components/PublicImage";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, UserPlus } from "lucide-react";
import { useSignup } from "@/hooks/useSignup";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  authCard,
  authDecorSvg,
  authDividerLine,
  authDividerText,
  authError,
  authFieldWrap,
  authFooterBorder,
  authFooterText,
  authHint,
  authInputPadding,
  authInputWithToggle,
  authLabelBlock,
  authLinkInline,
  authLogoWrap,
  authPageSection,
  authSelect,
  authSelectChevronClasses,
  authSubmitBtn,
  authSubtitle,
  authSuccess,
  authTitle,
  authTogglePassword,
  authTrustBadge,
  authTrustCaption,
} from "@/lib/auth/authFormStyles";

const selectClass = `${authSelect} ${authSelectChevronClasses}`;

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    diabetesType: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signup, isLoading: signupLoading } = useSignup();
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const isLoading = signupLoading || googleLoading;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/myprofile");
    });
    return () => unsub();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const result = await signup(formData);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      diabetesType: "",
      password: "",
      confirmPassword: "",
    });

    setSuccessMessage(
      "¡Bienvenido a Glucolog! Te enviamos un correo de verificación. Revisa tu bandeja (y spam) antes de iniciar sesión."
    );

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const result = await signInWithGoogle();
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setSuccessMessage(
      result.isNewUser
        ? "¡Cuenta creada con Google! Completa tu perfil cuando puedas."
        : "¡Inicio de sesión con Google exitoso!"
    );
    setTimeout(() => {
      router.push("/myprofile");
    }, 800);
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
      <svg
        className={`${authDecorSvg} bottom-0 left-0 h-32 w-40 md:h-44 md:w-52`}
        viewBox="0 0 200 160"
        fill="none"
        aria-hidden
      >
        <path
          d="M20 150 C 80 110, 120 70, 160 20"
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
        className="relative z-10 w-full max-w-lg"
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
          <h1 className={authTitle}>Únete a Glucolog</h1>
          <p className={authSubtitle}>
            Tu asistente inteligente para el control de la diabetes
          </p>
        </div>

        <div className={authCard}>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={authLabelBlock}>
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  className={authInputPadding}
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className={authLabelBlock}>
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  className={authInputPadding}
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={authLabelBlock}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                className={authInputPadding}
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gender" className={authLabelBlock}>
                  Sexo
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={selectClass}
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="diabetesType" className={authLabelBlock}>
                  Tipo de diabetes
                </label>
                <select
                  id="diabetesType"
                  name="diabetesType"
                  className={selectClass}
                  value={formData.diabetesType}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  <option value="tipo1">Tipo 1</option>
                  <option value="tipo2">Tipo 2</option>
                  <option value="gestacional">Gestacional</option>
                  <option value="no">Ninguno</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className={authLabelBlock}>
                Contraseña
              </label>
              <div className={authFieldWrap}>
                <input
                  id="password"
                  name="password"
                  className={authInputWithToggle}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mayúscula, minúscula y número"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={authTogglePassword}
                  onClick={() => setShowPassword((v) => !v)}
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

            <div>
              <label htmlFor="confirmPassword" className={authLabelBlock}>
                Confirmar contraseña
              </label>
              <div className={authFieldWrap}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className={authInputWithToggle}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={authTogglePassword}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación"
                      : "Mostrar confirmación"
                  }
                >
                  {showConfirmPassword ? (
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

            <p className={authHint}>
              La contraseña debe tener al menos 6 caracteres e incluir una
              mayúscula, una minúscula y un número.
            </p>

            {errorMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={authError}
              >
                {errorMessage}
              </motion.div>
            ) : null}

            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={authSuccess}
              >
                {successMessage}
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 ${authSubmitBtn(signupLoading)}`}
            >
              {signupLoading ? (
                <>
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 opacity-95" aria-hidden />
                  Crear cuenta
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className={authDividerLine} />
            <span className={authDividerText}>o</span>
            <div className={authDividerLine} />
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            isLoading={googleLoading}
            label="Registrarse con Google"
          />

          <div className={authFooterBorder}>
            <p className={authFooterText}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className={authLinkInline}>
                Inicia sesión
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
