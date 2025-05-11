import dayjs, { Dayjs } from 'dayjs';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db, auth } from "@/app/firebase/config";
import { Event } from "@/types/events";

export class CalendarService {
  /**
   * Obtiene los días del mes actual para mostrar en el calendario
   */
  static getCalendarDays(currentDate: Dayjs): Dayjs[] {
    const startDay = currentDate.startOf("month").startOf("week");
    const endDay = currentDate.endOf("month").endOf("week");
    
    const days: Dayjs[] = [];
    let day = startDay;
    
    while (day.isBefore(endDay, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }
    
    return days;
  }
  
  /**
   * Obtiene los eventos para un día específico
   */
  static getEventsForDay(events: Event[], date: Dayjs): Event[] {
    return events.filter((event) => dayjs(event.date).isSame(date, "day"));
  }
  
  /**
   * Obtiene todos los eventos del usuario desde Firestore
   */
  static async fetchEvents(): Promise<Event[]> {
    if (!auth.currentUser) {
      return [];
    }
    
    try {
      const eventsSnapshot = await getDocs(
        collection(db, "users", auth.currentUser.uid, "events")
      );
      
      return eventsSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Event)
      );
    } catch (error) {
      console.error("Error cargando los eventos desde Firestore:", error);
      throw error;
    }
  }
  
  /**
   * Añade un nuevo evento
   */
  static async addEvent(eventData: Omit<Event, 'id'>): Promise<string> {
    if (!auth.currentUser) {
      throw new Error("Usuario no autenticado");
    }
    
    try {
      const docRef = await addDoc(
        collection(db, "users", auth.currentUser.uid, "events"),
        eventData
      );
      
      // Programar notificación para el evento
      
      return docRef.id;
    } catch (error) {
      console.error("Error al añadir evento:", error);
      throw error;
    }
  }
  
  /**
   * Actualiza un evento existente
   */
  static async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error("Usuario no autenticado");
    }
    
    try {
      const eventRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "events",
        eventId
      );
      
      await updateDoc(eventRef, eventData);
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      throw error;
    }
  }
  
  /**
   * Elimina un evento
   */
  static async deleteEvent(eventId: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error("Usuario no autenticado");
    }
    
    try {
      const eventRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "events",
        eventId
      );
      
      await deleteDoc(eventRef);
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      throw error;
    }
  }
  
  /**
   * Marca un evento como completado
   */
  static async completeEvent(eventId: string, completed: boolean = true): Promise<void> {
    return this.updateEvent(eventId, { completed });
  }
  
  /**
   * Actualiza la duración real de un evento (para actividades físicas)
   */
  static async updateEventDuration(eventId: string, duration: number): Promise<void> {
    return this.updateEvent(eventId, { actualDuration: duration });
  }
  
  /**
   * Calcula estadísticas mensuales de eventos
   */
  static calculateMonthlyStats(events: Event[], currentDate: Dayjs) {
    const stats = {
      completedMedications: 0,
      completedExercises: 0,
      totalDuration: 0,
      exercisesByType: {} as Record<string, number>,
      medicationsByType: {} as Record<string, number>,
    };

    const currentMonthStart = currentDate.startOf("month");
    const currentMonthEnd = currentDate.endOf("month");

    events.forEach((event) => {
      const eventDate = dayjs(event.date);
      if (
        event.completed &&
        eventDate.isAfter(currentMonthStart) &&
        eventDate.isBefore(currentMonthEnd)
      ) {
        if (event.type === "medication") {
          stats.completedMedications++;
          const type = event.medicationType || "otros";
          stats.medicationsByType[type] =
            (stats.medicationsByType[type] || 0) + 1;
        } else {
          stats.completedExercises++;
          stats.totalDuration +=
            event.actualDuration || event.plannedDuration || 0;
          const type = event.activityType || "otros";
          stats.exercisesByType[type] = (stats.exercisesByType[type] || 0) + 1;
        }
      }
    });

    return stats;
  }
}