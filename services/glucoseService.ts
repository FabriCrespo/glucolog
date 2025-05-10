import { db } from "@/app/firebase/config";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { GlucoseRecord } from "@/types/glucose";

// Función de Registro
export async function registerGlucose(
  userID: string,
  glucoseLevel: number,
  ateSomething: boolean,
  foodEaten?: string,
  foodMeal?: string
) {
  try {
    // Validar que userID no sea undefined o null
    if (!userID) {
      throw new Error("ID de usuario no válido");
    }
    
    // Validar que glucoseLevel sea un número válido
    if (isNaN(glucoseLevel) || glucoseLevel < 0) {
      throw new Error("Nivel de glucosa no válido");
    }
    
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // Hora en formato HH:MM:SS

    // Crear el objeto de datos con valores por defecto para campos opcionales
    const glucoseData = {
      glucoseLevel: glucoseLevel,
      date: date,
      time: time,
      timeStamp: Timestamp.now(),
      ateSomething: ateSomething,
      foodMeal: ateSomething ? (foodMeal || "No especificado") : null,
      foodEaten: ateSomething ? (foodEaten || "No especificado") : null,
    };

    // Guardar en Firestore
    const docRef = await addDoc(
      collection(db, "glucoseRecords", userID, "records"), 
      glucoseData
    );
    
    console.log("Registro guardado con ID:", docRef.id);
    return docRef.id; // Devolver el ID del documento creado
  } catch (e) {
    console.error("Error al añadir el registro: ", e);
    throw e;
  }
}

// Función para obtener registros por rango de fecha
export async function fetchGlucoseRecords(userID: string, days: number): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      recordsRef,
      where("timeStamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timeStamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as GlucoseRecord);
  } catch (error) {
    console.error("Error fetching glucose records:", error);
    throw error;
  }
}

// Función para obtener todos los registros históricos
export async function fetchAllGlucoseRecords(userID: string): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const q = query(recordsRef, orderBy("timeStamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as GlucoseRecord);
  } catch (error) {
    console.error("Error fetching all glucose records:", error);
    throw error;
  }
}

