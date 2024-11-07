import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBiZ3Niu-9s6Zrzt72pGahku7vi_iZM9jM",
    authDomain: "glucolog-f2a0a.firebaseapp.com",
    databaseURL: "https://glucolog-f2a0a-default-rtdb.firebaseio.com/",
    projectId: "glucolog-f2a0a",
    storageBucket: "glucolog-f2a0a.appspot.com",
    messagingSenderId: "937776763925",
    appId: "1:937776763925:web:149971b4ac82e9c4026a1c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);  

export { app, auth, db, database, storage };
