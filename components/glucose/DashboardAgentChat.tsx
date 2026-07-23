"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface DashboardAgentChatProps {
  userId: string;
  latestGlucose?: number | null;
  embedded?: boolean;
}

const SUGGESTIONS = [
  "¿Qué hago si estoy en 190?",
  "Tengo 65, ¿es una baja?",
  "¿Cuándo debo medir después de comer?",
];

export default function DashboardAgentChat({
  userId,
  latestGlucose,
  embedded = false,
}: DashboardAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const contextHint =
          latestGlucose != null
            ? `\n\n[Contexto app: última glucosa registrada ${latestGlucose} mg/dL. Responde en español, educativo, sin diagnosticar ni recetar.]`
            : "\n\n[Responde en español, educativo, sin diagnosticar ni recetar.]";

        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: `${trimmed}${contextHint}`,
          }),
        });

        const data = (await res.json()) as {
          answer?: string;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(
            data.error ||
              "No se pudo contactar al asistente. ¿Está corriendo npm run dev?"
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              data.answer?.trim() ||
              "No tengo una respuesta clara ahora. Intenta de nuevo.",
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de chat");
      } finally {
        setLoading(false);
      }
    },
    [latestGlucose, loading, userId]
  );

  return (
    <section
      aria-label="Asistente Glucolog"
      className={embedded ? "" : "border-t border-slate-200 pt-10 lg:pt-14"}
    >
      {embedded ? null : (
        <>
          <p className="dash-eyebrow">Asistente</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Pregunta a GlucoLog AI
          </h2>
          <p className="dash-body mt-3 max-w-2xl">
            Orientación educativa sobre glucosa, comidas y hábitos. No sustituye
            a tu médico.
          </p>
        </>
      )}

      {latestGlucose != null ? (
        <p className={`${embedded ? "mt-0" : "mt-3"} text-xs font-light text-slate-500`}>
          Contexto: última lectura {latestGlucose} mg/dL
        </p>
      ) : null}

      <div
        ref={listRef}
        className={`${embedded && latestGlucose == null ? "mt-0" : "mt-6"} max-h-72 space-y-3 overflow-y-auto border-y border-slate-100 py-4 dark:border-slate-800`}
      >
        {messages.length === 0 && !loading ? (
          <p className="dash-muted text-sm">
            Prueba una pregunta rápida o escribe la tuya abajo.
          </p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] text-sm font-light leading-relaxed ${
              m.role === "user"
                ? "ml-auto border-l-2 border-vitality-primary/60 pl-3 text-slate-800 dark:text-emerald-50"
                : "border-l-2 border-slate-200 pl-3 text-slate-600 dark:border-slate-700 dark:text-emerald-200/90"
            }`}
          >
            <p className="dash-stat-label mb-1">
              {m.role === "user" ? "Tú" : "GlucoLog AI"}
            </p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Pensando…
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => void send(s)}
            className="rounded-none border border-slate-200 px-3 py-1.5 text-xs font-light text-slate-600 transition-colors hover:border-emerald-300 hover:text-vitality-primary disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex items-end gap-3 border-b border-slate-200 pb-2 dark:border-slate-700"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="dash-agent-input" className="sr-only">
          Tu pregunta
        </label>
        <input
          id="dash-agent-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej. ¿Qué hago si estoy en 190?"
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm font-light text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="dash-btn-ghost inline-flex items-center gap-1.5 disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
          Enviar
        </button>
      </form>
    </section>
  );
}
