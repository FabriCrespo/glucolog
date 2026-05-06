import type { GlucoseFormSnapshot } from "@/types/dashboard-glucose";

const MEASUREMENT_CONTEXTS = new Set([
  "fasting",
  "pre_meal",
  "post_meal_1h",
  "post_meal_2h",
  "bedtime",
  "random",
]);

const ACTIVITY_LEVELS = new Set(["none", "light", "moderate", "intense"]);

/**
 * Validación síncrona del formulario de glucosa.
 * Devuelve mensaje de error en español o null si es válido.
 */
export function validateGlucoseForm(form: GlucoseFormSnapshot): string | null {
  if (form.glucoseLevel === "") {
    return "Por favor ingrese un nivel de glucosa";
  }

  if (!MEASUREMENT_CONTEXTS.has(form.measurementContext)) {
    return "Selecciona un contexto de medición válido";
  }

  if (typeof form.glucoseLevel === "number") {
    if (form.glucoseLevel < 30 || form.glucoseLevel > 600) {
      return "El nivel de glucosa debe estar entre 30 y 600 mg/dL";
    }
  }

  if (form.ateSomething) {
    if (!form.foodMeal.trim()) {
      return "Por favor seleccione el tipo de comida";
    }
    if (!form.foodEaten.trim()) {
      return "Por favor indique qué comió";
    }
    if (form.minutesSinceMeal === "") {
      return "Indica cuántos minutos han pasado desde la comida";
    }
    if (typeof form.minutesSinceMeal === "number") {
      if (form.minutesSinceMeal < 0 || form.minutesSinceMeal > 720) {
        return "Los minutos desde la comida deben estar entre 0 y 720";
      }
    }
  }

  if (form.medicationTakenRecently && !form.medicationType.trim()) {
    return "Indica el tipo de medicación reciente";
  }

  if (!ACTIVITY_LEVELS.has(form.activityLevelLastHours)) {
    return "Selecciona un nivel de actividad válido";
  }

  if (form.stressLevel !== "" && (form.stressLevel < 1 || form.stressLevel > 5)) {
    return "El nivel de estrés debe estar entre 1 y 5";
  }

  if (form.notes.length > 400) {
    return "Las notas no pueden superar los 400 caracteres";
  }

  return null;
}

export function parseGlucoseLevel(level: number | ""): number | null {
  if (level === "") return null;
  const n = typeof level === "string" ? parseInt(level, 10) : level;
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
