"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { WHATSAPP_NUMBER } from "@/lib/content";

type ChatMessage = { role: "user" | "bot"; text: string };

const GREETING: ChatMessage = {
  role: "bot",
  text: "Hola, soy el asistente de BRUMA1800. Pregúntame por precios, disponibilidad de cosecha o envíos.",
};

const SESSION_KEY = "bruma1800-chat-session";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, id);
  return id;
}

/**
 * Widget flotante de asistencia rápida. Habla con `/api/chat`, que a su vez
 * reenvía a n8n (ver src/app/api/chat/route.ts) — este componente no sabe ni
 * le importa si el workflow ya está publicado: mientras no lo esté, recibe
 * un mensaje de respaldo y sigue funcionando igual.
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionId = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionId.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextHistory = [...messages, { role: "user" as const, text }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current, history: nextHistory }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply as string }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-3"
      style={{
        right: "max(1.25rem, env(safe-area-inset-right))",
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <div className="flex h-[min(70vh,520px)] w-[min(92vw,360px)] flex-col overflow-hidden overscroll-contain rounded-2xl border border-cafe-profundo/14 bg-hueso-claro shadow-[0_24px_60px_-24px_rgba(18,9,4,0.45)]">
          <header className="flex items-center justify-between bg-cafe-profundo px-5 py-4">
            <p className="font-editorial text-lg text-hueso italic">Asistente BRUMA1800</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar el chat"
              className="cursor-pointer text-piedra-calida transition-colors hover:text-hueso"
            >
              ✕
            </button>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {messages.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-[1.5] ${
                  m.role === "user"
                    ? "ml-auto rounded-br-sm bg-terracota text-hueso-claro"
                    : "mr-auto rounded-bl-sm bg-piedra-calida text-cafe-profundo"
                }`}
              >
                {m.text}
              </p>
            ))}
            {sending && <p className="mr-auto text-sm text-tierra">Escribiendo…</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-cafe-profundo/12 p-3">
            <label htmlFor="chat-message-input" className="sr-only">
              Escribe tu mensaje
            </label>
            <input
              id="chat-message-input"
              name="message"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje…"
              disabled={sending}
              className="min-w-0 flex-1 rounded-full border border-cafe-profundo/16 bg-white px-4 py-2.5 text-[15px] text-cafe-profundo outline-none placeholder:text-gris-calido focus-visible:border-terracota-viva"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Enviar mensaje"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-terracota text-hueso-claro transition-colors hover:bg-terracota-viva disabled:cursor-not-allowed disabled:opacity-40"
            >
              ➤
            </button>
          </form>

          <p className="border-t border-cafe-profundo/10 px-4 py-2 text-center text-xs text-gris-calido">
            ¿Prefieres hablar directo?{" "}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener" className="text-terracota hover:text-terracota-viva">
              Escríbenos por WhatsApp
            </a>
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar el asistente" : "Abrir el asistente"}
        aria-expanded={open}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-terracota text-2xl text-hueso-claro shadow-[0_12px_28px_-8px_rgba(18,9,4,0.5)] transition-transform hover:scale-105 hover:bg-terracota-viva"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
