import MonthlyStats from "@/components/schedule/MonthlyStats";

export interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  dateTime: string;
  details?: string;
  dose?: string;
  frequency?: string;
  medicationType?: string;
  instructions?: string;
  activityType?: string;
  plannedDuration?: number;
  actualDuration?: number;
  intensity?: "baja" | "media" | "alta";
  time: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  state: boolean;
}

export interface MonthlyStatsType {
  completedMedications: number;
  completedExercises: number;
  totalDuration: number;
  exercisesByType: Record<string, number>;
  medicationsByType: Record<string, number>;
}   