import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { GOSERVI_SYSTEM_PROMPT } from "@/lib/chat-system-prompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  // Rate limit: 15 messages par minute par IP
  const ip = getClientIp(req);
  const rl = await rateLimit(`goservi_chat:${ip}`, 15, 60_000);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: "Trop de messages. Veuillez patienter une minute." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages ?? [];
  } catch {
    return new Response(
      JSON.stringify({ error: "Corps de requête invalide." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validation: max 20 messages, chaque message < 2000 chars
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Messages manquants." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const capped = messages.slice(-20); // garder les 20 derniers
  const sanitized = capped
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content).slice(0, 2000),
    }));

  if (sanitized.length === 0) {
    return new Response(
      JSON.stringify({ error: "Aucun message valide." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Vérifier que la clé API est configurée
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Service de chat non configuré." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Streaming avec l'API Anthropic
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: GOSERVI_SYSTEM_PROMPT,
      messages: sanitized,
    });

    // Retourner un ReadableStream text/event-stream
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch {
          // ignore streaming errors gracefully
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Erreur du service de chat. Réessayez." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
