import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy del chatbot hacia n8n. El front nunca llama al webhook de n8n
 * directamente: pasa siempre por aquí, así la URL del workflow (que puede
 * llevar un token en el path) se queda en el servidor y nunca se expone al
 * navegador.
 *
 * Para activar el bot en producción, solo hace falta:
 *   1. Publicar un workflow en n8n con un nodo "Webhook" (POST) que reciba
 *      { message, sessionId, history, source } y devuelva { reply }.
 *   2. Poner esa URL en la variable de entorno N8N_WEBHOOK_URL (ver .env.example).
 * Sin esa variable, este endpoint sigue respondiendo — con un mensaje de
 * respaldo — para que ChatbotWidget nunca se rompa ni necesite cambios de
 * código el día que el workflow quede listo.
 */

export const runtime = "nodejs";

const FALLBACK_REPLY =
  "El asistente todavía no está conectado. Mientras tanto, escríbenos por WhatsApp y te respondemos directo desde la finca.";

type ChatMessage = { role: "user" | "bot"; text: string };

type ChatRequestBody = {
  message?: string;
  sessionId?: string;
  history?: ChatMessage[];
};

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ reply: FALLBACK_REPLY, connected: false });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId: body.sessionId ?? crypto.randomUUID(),
        history: body.history ?? [],
        source: "bruma1800-web",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      throw new Error(`n8n respondió ${upstream.status}`);
    }

    const data: unknown = await upstream.json();
    const reply =
      typeof data === "object" && data !== null && typeof (data as { reply?: unknown }).reply === "string"
        ? (data as { reply: string }).reply
        : FALLBACK_REPLY;

    return NextResponse.json({ reply, connected: true });
  } catch (error) {
    console.error("[chat] error consultando n8n:", error);
    return NextResponse.json(
      { reply: "Tuvimos un problema para responder. Intenta de nuevo o escríbenos por WhatsApp.", connected: false },
      { status: 200 },
    );
  }
}
