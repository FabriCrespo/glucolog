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

const inputBase =
  "block w-full rounded-xl border border-gray-200 bg-vitality-secondary/50 py-3 px-3 text-vitality-neutral placeholder:text-gray-400 focus:border-vitality-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-vitality-primary/25 disabled:opacity-60";

const labelClass = "mb-1.5 block text-sm font-medium text-vitality-neutral";

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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-vitality-secondary via-[#eef6f3] to-vitality-secondary px-4 py-10 md:py-14">
      <svg
        className="pointer-events-none absolute right-0 top-0 h-40 w-48 text-vitality-primary/15 md:h-52 md:w-64"
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
        className="pointer-events-none absolute bottom-0 left-0 h-32 w-40 text-vitality-tertiary/12 md:h-44 md:w-52"
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80">
            <PublicImage
              src="/icons/food.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-vitality-neutral md:text-[1.65rem]">
            Únete a Glucolog
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-vitality-neutral/65">
            Tu asistente inteligente para el control de la diabetes
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-vitality-secondary sm:p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  className={inputBase}
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  className={inputBase}
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
              <label htmlFor="email" className={labelClass}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                className={inputBase}
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
                <label htmlFor="gender" className={labelClass}>
                  Sexo
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`${inputBase} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
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
                <label htmlFor="diabetesType" className={labelClass}>
                  Tipo de diabetes
                </label>
                <select
                  id="diabetesType"
                  name="diabetesType"
                  className={`${inputBase} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
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
              <label htmlFor="password" className={labelClass}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  className={`${inputBase} pr-11`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mayúscula, minúscula y número"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
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
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`${inputBase} pr-11`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
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

            <p className="text-xs leading-relaxed text-vitality-neutral/55">
              La contraseña debe tener al menos 6 caracteres e incluir una
              mayúscula, una minúscula y un número.
            </p>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100"
              >
                {errorMessage}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-vitality-secondary p-3 text-sm text-vitality-neutral ring-1 ring-vitality-tertiary/25"
              >
                {successMessage}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-vitality-primary/45 focus:ring-offset-2 ${
                isLoading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-vitality-primary hover:bg-vitality-primary-dark active:scale-[0.99]"
              }`}
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
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-vitality-neutral/45">
              o
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            isLoading={googleLoading}
            label="Registrarse con Google"
          />

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-vitality-neutral/80">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-vitality-tertiary transition-colors hover:text-vitality-primary-dark hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vitality-secondary text-vitality-primary ring-1 ring-vitality-tertiary/30">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vitality-secondary text-vitality-primary ring-1 ring-vitality-tertiary/30">
              <BadgeCheck className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-vitality-neutral/45">
            Powered by Atmospheric Intelligence
          </p>
        </div>
      </motion.div>
    </section>
  );
}
