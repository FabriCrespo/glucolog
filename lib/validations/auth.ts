import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .email("Correo electrónico no válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .email("Correo electrónico no válido"),
});

export type PasswordResetInput = z.infer<typeof passwordResetRequestSchema>;

const passwordField = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .regex(/[A-Z]/, "Incluye al menos una letra mayúscula")
  .regex(/[a-z]/, "Incluye al menos una letra minúscula")
  .regex(/[0-9]/, "Incluye al menos un número");

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "El nombre es obligatorio"),
    lastName: z.string().trim().min(1, "El apellido es obligatorio"),
    email: z.string().min(1, "Ingresa tu correo").email("Correo no válido"),
    gender: z
      .string()
      .min(1, "Selecciona tu sexo")
      .refine((v) => ["male", "female", "other"].includes(v), {
        message: "Selecciona un sexo válido",
      }),
    diabetesType: z
      .string()
      .min(1, "Selecciona tu tipo de diabetes")
      .refine((v) => ["tipo1", "tipo2", "gestacional", "no"].includes(v), {
        message: "Selecciona un tipo válido",
      }),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

/** Primer mensaje legible de error Zod (formulario) */
export function zodErrorMessage(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Datos no válidos";
  return first.message;
}
