/**
 * Formulario local para crear un evento (antes de persistir en Firestore).
 */
export interface NewEventFormState {
  title: string;
  type: string;
  details: string;
  dose: string;
  frequency: string;
  medicationType: string;
  instructions: string;
  activityType: string;
  plannedDuration: number;
  intensity: "baja" | "media" | "alta";
  time: string;
  completed: boolean;
  notes: string;
  state: boolean;
}
