import { db } from "@/app/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Firestore doc ~1 MB; dejamos margen para el resto del perfil. */
const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 450_000;

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  diabetesType: string;
  gender: string;
  age?: number;
  weight?: number;
  height?: number;
  phone?: string;
  address?: string;
  /** URL https (p. ej. Google) o data URL base64 guardada en Firestore. */
  photoURL?: string;
  uid?: string;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function updateUserData(userId: string, userData: UserData): Promise<void> {
  try {
    await setDoc(doc(db, "users", userId), userData, { merge: true });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

/** Guarda la foto como data URL (base64) en Firestore, sin usar Storage. */
export async function encodeProfilePhotoAsDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });

  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Selecciona una imagen válida para tu foto de perfil.");
  }

  if (dataUrl.length > MAX_PROFILE_PHOTO_DATA_URL_LENGTH) {
    throw new Error(
      "La foto comprimida sigue siendo muy grande. Prueba con otra imagen."
    );
  }

  return dataUrl;
}
