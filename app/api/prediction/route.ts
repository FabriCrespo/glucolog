import { NextResponse } from "next/server";

const PREDICTOR_URL =
  process.env.PREDICTOR_URL?.trim() || "http://127.0.0.1:8001/predict";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const response = await fetch(PREDICTOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "Prediction service error", detail },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Prediction request failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
