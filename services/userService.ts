import { auth, db, storage } from "@/app/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";

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
  photoURL?: string;
  uid?: string; // Añadimos la propiedad uid como opcional
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

export async function uploadProfilePhoto(user: User, file: File): Promise<string> {
  try {
    const photoRef = ref(storage, `profilePictures/${user.uid}`);
    await uploadBytes(photoRef, file);
    return await getDownloadURL(photoRef);
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
}
