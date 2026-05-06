import { NextResponse } from "next/server";
import axios from "axios";
import { passwordResetRequestSchema } from "@/lib/validations/auth";
import { mapIdentityToolkitMessage } from "@/lib/auth/firebase-rest-errors";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const parsed = passwordResetRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configuración del servidor incompleta" },
      { status: 500 }
    );
  }

  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        requestType: "PASSWORD_RESET",
        email: parsed.data.email,
      }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const data = e.response?.data as {
        error?: { message?: string };
      };
      const code = data?.error?.message;
      return NextResponse.json(
        { error: mapIdentityToolkitMessage(code) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al solicitar el restablecimiento" },
      { status: 500 }
    );
  }
}
