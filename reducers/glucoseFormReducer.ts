import type { DateRangeLabel, GlucoseFormSnapshot } from "@/types/dashboard-glucose";

export type GlucoseFormAction =
  | { type: "SET_GLUCOSE_LEVEL"; payload: number | "" }
  | {
      type: "SET_MEASUREMENT_CONTEXT";
      payload:
        | "fasting"
        | "pre_meal"
        | "post_meal_1h"
        | "post_meal_2h"
        | "bedtime"
        | "random";
    }
  | { type: "SET_ATE_SOMETHING"; payload: boolean }
  | { type: "SET_FOOD_EATEN"; payload: string }
  | { type: "SET_FOOD_MEAL"; payload: string }
  | { type: "SET_MINUTES_SINCE_MEAL"; payload: number | "" }
  | { type: "SET_MEDICATION_TAKEN_RECENTLY"; payload: boolean }
  | { type: "SET_MEDICATION_TYPE"; payload: string }
  | {
      type: "SET_ACTIVITY_LEVEL_LAST_HOURS";
      payload: "none" | "light" | "moderate" | "intense";
    }
  | { type: "SET_STRESS_LEVEL"; payload: 1 | 2 | 3 | 4 | 5 | "" }
  | { type: "SET_NOTES"; payload: string }
  | { type: "SET_DATE_RANGE"; payload: DateRangeLabel }
  | { type: "RESET_AFTER_SUBMIT" };

export const initialGlucoseFormState: GlucoseFormSnapshot = {
  glucoseLevel: "",
  measurementContext: "random",
  ateSomething: false,
  foodEaten: "",
  foodMeal: "",
  minutesSinceMeal: "",
  medicationTakenRecently: false,
  medicationType: "",
  activityLevelLastHours: "none",
  stressLevel: "",
  notes: "",
  dateRange: "7 días",
};

export function glucoseFormReducer(
  state: GlucoseFormSnapshot,
  action: GlucoseFormAction
): GlucoseFormSnapshot {
  switch (action.type) {
    case "SET_GLUCOSE_LEVEL":
      return { ...state, glucoseLevel: action.payload };

    case "SET_MEASUREMENT_CONTEXT":
      return { ...state, measurementContext: action.payload };

    case "SET_ATE_SOMETHING": {
      const ate = action.payload;
      return {
        ...state,
        ateSomething: ate,
        ...(ate
          ? {}
          : {
              foodMeal: "",
              foodEaten: "",
              minutesSinceMeal: "",
            }),
      };
    }

    case "SET_FOOD_EATEN":
      return { ...state, foodEaten: action.payload };

    case "SET_FOOD_MEAL":
      return { ...state, foodMeal: action.payload };

    case "SET_MINUTES_SINCE_MEAL":
      return { ...state, minutesSinceMeal: action.payload };

    case "SET_MEDICATION_TAKEN_RECENTLY":
      return {
        ...state,
        medicationTakenRecently: action.payload,
        ...(action.payload ? {} : { medicationType: "" }),
      };

    case "SET_MEDICATION_TYPE":
      return { ...state, medicationType: action.payload };

    case "SET_ACTIVITY_LEVEL_LAST_HOURS":
      return { ...state, activityLevelLastHours: action.payload };

    case "SET_STRESS_LEVEL":
      return { ...state, stressLevel: action.payload };

    case "SET_NOTES":
      return { ...state, notes: action.payload };

    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.payload };

    case "RESET_AFTER_SUBMIT":
      return {
        ...state,
        glucoseLevel: "",
        measurementContext: "random",
        ateSomething: false,
        foodEaten: "",
        foodMeal: "",
        minutesSinceMeal: "",
        medicationTakenRecently: false,
        medicationType: "",
        activityLevelLastHours: "none",
        stressLevel: "",
        notes: "",
      };

    default:
      return state;
  }
}
