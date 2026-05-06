/** Mensajes para errores REST de Identity Toolkit (sendOobCode, etc.) */
export function mapIdentityToolkitMessage(code?: string): string {
  const map: Record<string, string> = {
    EMAIL_NOT_FOUND: "No existe una cuenta con este correo electrónico.",
    INVALID_EMAIL: "El formato del correo electrónico no es válido.",
    MISSING_EMAIL: "Indica un correo electrónico.",
    TOO_MANY_ATTEMPTS_TRY_LATER:
      "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    OPERATION_NOT_ALLOWED: "Esta operación no está permitida.",
    USER_DISABLED: "Esta cuenta está deshabilitada.",
  };
  return map[code ?? ""] ?? "No se pudo enviar el correo. Inténtalo más tarde.";
}
