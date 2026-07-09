/** URL de retorno tras verificación o reset (respeta basePath en GitHub Pages). */
export function getAuthContinueUrl(path = "/login"): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}${base}${normalizedPath}`;
  }

  return `${base}${normalizedPath}`;
}

export function getEmailVerificationSettings() {
  return {
    url: getAuthContinueUrl("/login"),
    handleCodeInApp: false,
  };
}

export function getPasswordResetSettings() {
  return {
    url: getAuthContinueUrl("/login"),
    handleCodeInApp: false,
  };
}
