import { z } from "zod";
import type { NewEventFormState } from "@/types/schedule";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const newEventFormSchema = z
  .object({
    title: z.string().max(120),
    type: z.enum(["medication", "exercise"]),
    details: z.string().max(500),
    dose: z.string().max(80),
    frequency: z.string().max(80),
    medicationType: z.string().max(80),
    instructions: z.string().max(1000),
    activityType: z.string().max(80),
    plannedDuration: z.number().min(5).max(480),
    intensity: z.enum(["baja", "media", "alta"]),
    time: z.string(),
    completed: z.boolean(),
    notes: z.string().max(2000),
    state: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const title = data.title.trim();
    if (!title) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "Escribe un título.",
      });
    }
    if (!TIME_REGEX.test(data.time)) {
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "Indica una hora válida (HH:MM).",
      });
    }

    if (data.type === "medication") {
      if (!data.medicationType.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["medicationType"],
          message: "Selecciona el tipo de medicamento.",
        });
      }
      if (!data.dose.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["dose"],
          message: "Indica la dosis.",
        });
      }
      if (!data.frequency.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["frequency"],
          message: "Selecciona la frecuencia.",
        });
      }
    } else {
      if (!data.activityType.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["activityType"],
          message: "Selecciona el tipo de actividad.",
        });
      }
    }
  });

export type NewEventFormErrors = Partial<
  Record<keyof NewEventFormState | "_form", string>
>;

export function mapZodErrorsToForm(error: z.ZodError): NewEventFormErrors {
  const out: NewEventFormErrors = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && out[path as keyof NewEventFormErrors] == null) {
      out[path as keyof NewEventFormErrors] = issue.message;
    }
  }
  return out;
}

function normalizeForm(data: z.infer<typeof newEventFormSchema>): NewEventFormState {
  return {
    ...data,
    title: data.title.trim(),
    details: data.details.trim(),
    dose: data.dose.trim(),
    frequency: data.frequency.trim(),
    medicationType: data.medicationType.trim(),
    instructions: data.instructions.trim(),
    activityType: data.activityType.trim(),
    notes: data.notes.trim(),
  };
}

export function parseNewEventForm(
  data: NewEventFormState
):
  | { success: true; data: NewEventFormState }
  | { success: false; errors: NewEventFormErrors } {
  const result = newEventFormSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: mapZodErrorsToForm(result.error),
    };
  }
  return { success: true, data: normalizeForm(result.data) };
}

export const exerciseCompletionDurationSchema = z
  .number()
  .int()
  .min(5, "Mínimo 5 minutos.")
  .max(720, "Máximo 720 minutos.");
