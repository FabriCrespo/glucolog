import { Timestamp } from "firebase/firestore";

export interface GlucoseRecord {
  glucoseLevel: number;
  date: string;
  time: string;
  timeStamp: Timestamp;
  ateSomething: boolean;
  foodMeal?: string | null;
  foodEaten?: string | null;
}