import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = { messages?: unknown };

async function fetchNewsContext(userQuery: string) {
  try {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const term = userQuery.replace(/[%_]/g, "\\$&").slice(0, 80);
    const [{ data: latest }, { data: matched }] = await Promise.all([
      supabase
        .from("news")
        .select("slug,title,summary,category,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(15),
      term
        ? supabase
            .from("news")
            .select("slug,title,summary,category,published_at")
            .eq("is_published", true)
            .or(`title.ilike.%${term}%,summary.ilike.%${term}%`)
            .order("published_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const seen = new Set<string>();
    const combined = [...(matched ?? []), ...(latest ?? [])].filter((r) => {
      if (seen.has(r.slug)) return false;
      seen.add(r.slug);
      return true;
    });
    return combined.slice(0, 18);
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Basic same-origin check to block cross-site abuse
        const origin = request.headers.get("origin");
        const referer = request.headers.get("referer");
        const host = request.headers.get("host") ?? "";
        const originOk =
          !origin ||
          origin.includes(host) ||
          (referer ? referer.includes(host) : false);
        if (!originOk) {
          return new Response("Forbidden", { status: 403 });
        }

        // Cap total payload size to bound cost exposure
        const raw = await request.text();
        if (raw.length > 32_000) {
          return new Response("Payload too large", { status: 413 });
        }
        let parsed: Body;
        try {
          parsed = JSON.parse(raw) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages } = parsed;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        // Cap number of messages and per-message length
        if (messages.length > 20) {
          return new Response("Too many messages", { status: 400 });
        }
        for (const m of messages as UIMessage[]) {
          const text =
            m?.parts
              ?.map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
              .join(" ") ?? "";
          if (text.length > 4000) {
            return new Response("Message too long", { status: 400 });
          }
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const uiMessages = messages as UIMessage[];
        const last = uiMessages[uiMessages.length - 1];
        const lastText =
          last?.parts
            ?.map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
            .join(" ") ?? "";

        const articles = await fetchNewsContext(lastText);
        const contextBlock = articles.length
          ? articles
              .map(
                (a) =>
                  `- [${a.category}] "${a.title}" — ${a.summary ?? ""} (URL: /news/${a.slug})`,
              )
              .join("\n")
          : "(no matching articles found)";

        const system = `You are "Halchal AI", the friendly news assistant for **Halchal India News** (halchalindianews.com).

## Rules
1. Detect the user's language (Hindi/Hinglish/English) and reply in the SAME language, naturally.
2. If the answer exists in the ARTICLES below, summarize it briefly and include a markdown link like [शीर्षक](/news/slug). Prefer website articles as primary source.
3. If no relevant article exists, answer from general knowledge and clearly say: "यह जानकारी हमारी वेबसाइट पर उपलब्ध नहीं है, यह सामान्य जानकारी है।" (or the English equivalent).
4. Cover any topic: India, all Indian states/districts/cities (Meerut, Hapur, Ghaziabad, Noida, Lucknow, Delhi etc.), government schemes, education, sports, business, tech, politics, entertainment, health, history, geography, GK.
5. You can summarize long articles, compare topics, explain news simply, and answer follow-ups.
6. Use crisp markdown: short paragraphs, **bold** for key points, bullet lists when useful. Never invent article URLs — only link slugs shown in ARTICLES.
7. Keep answers focused and readable on mobile.

## LIVE ARTICLES (top matches + latest, use these first)
${contextBlock}
`;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(uiMessages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
      },
    },
  },
});
