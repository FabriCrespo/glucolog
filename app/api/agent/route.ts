import { NextRequest, NextResponse } from "next/server";
import { DiabetesAgent } from "@/agent/core/DiabetesAgent";
import { GeminiProvider } from "@/agent/llm/GeminiProvider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userId, conversationId } = body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    if (typeof userId !== "string" || !userId.trim()) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const agent = new DiabetesAgent(new GeminiProvider());

    const result = await agent.chat({
      userId: userId.trim(),
      message: message.trim(),
      conversationId:
        typeof conversationId === "string" && conversationId.trim()
          ? conversationId.trim()
          : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unexpected agent error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
