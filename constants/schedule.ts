import type { NewEventFormState } from "@/types/schedule";

export const SUCCESS_TOAST_MS = 2000;

export const INITIAL_NEW_EVENT_FORM: NewEventFormState = {
  title: "",
  type: "medication",
  details: "",
  dose: "",
  frequency: "",
  medicationType: "",
  instructions: "",
  activityType: "",
  plannedDuration: 30,
  intensity: "media",
  time: "",
  completed: false,
  notes: "",
  state: false,
};
