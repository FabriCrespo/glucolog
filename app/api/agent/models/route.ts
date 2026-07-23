import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const pager = await ai.models.list();

    const models: Array<{
      name?: string;
      displayName?: string;
      description?: string;
      supportedActions?: string[];
    }> = [];

    for await (const model of pager) {
      models.push({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedActions: model.supportedActions,
      });
    }

    return NextResponse.json({
      count: models.length,
      models,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to list models";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
