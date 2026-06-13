/** Prefijo de ruta en GitHub Pages (p. ej. `/glucolog`). Vacío en desarrollo local. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Ruta pública con prefijo para assets en `/public`. */
export function assetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
