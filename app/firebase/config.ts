import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

/**
 * Usa solo `process.env.NEXT_PUBLIC_*` con nombres literales.
 * Con acceso dinámico `process.env[key]` el bundler (Turbopack en dev) no
 * inyecta los valores en el cliente y quedan undefined.
 */
function firebaseConfigFromEnv() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const missing: string[] = [];
  if (!apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!databaseURL) missing.push("NEXT_PUBLIC_FIREBASE_DATABASE_URL");
  if (!projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!storageBucket) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missing.length) {
    const hint =
      process.env.GITHUB_PAGES === "true"
        ? "Configura `.env.production` o los secrets NEXT_PUBLIC_FIREBASE_* en GitHub Actions."
        : "Copia .env.example a .env y complétalas.";
    throw new Error(`Faltan variables de Firebase: ${missing.join(", ")}. ${hint}`);
  }

  return {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

const firebaseConfig = firebaseConfigFromEnv();
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = (() => {
  /**
   * En algunas redes (VPN, proxy corporativo, antivirus, extensiones)
   * Firestore puede fallar con WebChannel y quedar en offline.
   * Auto-detect long polling mejora la compatibilidad sin cambiar la API de uso.
   */
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    } as Parameters<typeof initializeFirestore>[1]);
  } catch {
    // Si ya fue inicializado (ej. HMR en desarrollo), reutilizamos la instancia.
    return getFirestore(app);
  }
})();
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, database, storage };
