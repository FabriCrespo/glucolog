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

const GOOGLE_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Cerraste la ventana de Google. Inténtalo de nuevo.",
  "auth/cancelled-popup-request": "Se canceló el inicio con Google.",
  "auth/popup-blocked":
    "El navegador bloqueó la ventana emergente. Permite popups e inténtalo otra vez.",
  "auth/account-exists-with-different-credential":
    "Este correo ya está registrado con otro método. Inicia sesión con email y contraseña.",
  "auth/operation-not-allowed":
    "El inicio con Google no está habilitado en Firebase. Actívalo en Authentication → Sign-in method.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado en Firebase. Añádelo en Authentication → Settings → Authorized domains.",
  "auth/network-request-failed":
    "Error de conexión. Verifica tu conexión a internet.",
  "auth/too-many-requests": "Demasiados intentos. Prueba más tarde.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/internal-error": "Error del servidor. Intenta de nuevo.",
};

const PASSWORD_RESET_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No existe una cuenta con este correo electrónico.",
  "auth/invalid-email": "El formato del correo electrónico no es válido.",
  "auth/missing-email": "Indica un correo electrónico.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "auth/operation-not-allowed": "El restablecimiento de contraseña no está habilitado.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/network-request-failed":
    "Error de conexión. Verifica tu conexión a internet.",
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

export function mapGoogleAuthError(error: unknown): string {
  if (error instanceof FirebaseError && error.code) {
    return (
      GOOGLE_MESSAGES[error.code] ??
      "No se pudo continuar con Google. Inténtalo de nuevo."
    );
  }
  if (error instanceof Error) return error.message;
  return "Error inesperado al autenticarse con Google.";
}

export function mapPasswordResetError(error: unknown): string {
  if (error instanceof FirebaseError && error.code) {
    return (
      PASSWORD_RESET_MESSAGES[error.code] ??
      "No se pudo enviar el correo. Inténtalo más tarde."
    );
  }
  if (error instanceof Error) return error.message;
  return "No se pudo enviar el correo. Inténtalo más tarde.";
}
