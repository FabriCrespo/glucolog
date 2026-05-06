import { FirebaseError } from "firebase/app";

const LOGIN_MESSAGES: Record<string, string> = {
  "auth/wrong-password": "La contraseña ingresada es incorrecta",
  "auth/user-not-found": "No existe una cuenta con este correo electrónico",
  "auth/invalid-email": "El formato del correo electrónico no es válido",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Inténtalo más tarde o restablece tu contraseña",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
  "auth/network-request-failed":
    "Error de conexión. Verifica tu conexión a internet",
  "auth/invalid-credential": "Correo o contraseña incorrectos",
};

const SIGNUP_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "Este correo ya está registrado. Inicia sesión o usa otro email.",
  "auth/invalid-email": "El formato del correo no es válido.",
  "auth/weak-password":
    "La contraseña es demasiado débil. Cumple los requisitos indicados.",
  "auth/operation-not-allowed": "El registro con email no está habilitado.",
  "auth/network-request-failed":
    "Error de conexión. Verifica tu conexión a internet.",
  "auth/too-many-requests": "Demasiados intentos. Prueba más tarde.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/quota-exceeded": "Cuota superada. Intenta más tarde.",
  "auth/internal-error": "Error del servidor. Intenta de nuevo.",
};

export function mapLoginError(error: unknown): string {
  if (error instanceof FirebaseError && error.code) {
    return LOGIN_MESSAGES[error.code] ?? "Error al iniciar sesión. Revisa tus datos.";
  }
  if (error instanceof Error) return error.message;
  return "Error al iniciar sesión.";
}

export function mapSignupError(error: unknown): string {
  if (error instanceof FirebaseError && error.code) {
    return SIGNUP_MESSAGES[error.code] ?? "No se pudo completar el registro.";
  }
  if (error instanceof Error) return error.message;
  return "Error inesperado al registrarse.";
}
