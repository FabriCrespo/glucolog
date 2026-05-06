/** Variables que debe cargar `.env` (ver `.env.example`). */
export const ENV_KEYS = {
  publicFirebase: [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const,
  admin: [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ] as const,
};

/** Opcional: úsalo en scripts o `instrumentation.ts` si quieres fallar al arrancar. */
export function validateEnv() {
  const all = [...ENV_KEYS.publicFirebase, ...ENV_KEYS.admin];
  for (const envVar of all) {
    if (!process.env[envVar]) {
      throw new Error(`Falta la variable de entorno: ${envVar}`);
    }
  }
}