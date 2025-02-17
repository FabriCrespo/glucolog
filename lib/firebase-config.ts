import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables or fallback to hardcoded config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBiZ3Niu-9s6Zrzt72pGahku7vi_iZM9jM",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "glucolog-f2a0a.firebaseapp.com",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://glucolog-f2a0a-default-rtdb.firebaseio.com/",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "glucolog-f2a0a",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "glucolog-f2a0a.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "937776763925",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:937776763925:web:149971b4ac82e9c4026a1c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);  

export { app, auth, db, database, storage };
