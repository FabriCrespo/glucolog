import { initializeApp, cert, getApps } from "firebase-admin/app";

function getAdminCredential() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL o FIREBASE_ADMIN_PRIVATE_KEY en .env"
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

export const initAdmin = () => {
  if (getApps().length === 0) {
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    initializeApp({
      credential: getAdminCredential(),
      ...(databaseURL ? { databaseURL } : {}),
    });
  }
};
