// Server-only helpers for SEO-friendly English slug generation.
// Uses Lovable AI Gateway to translate Hindi/non-ASCII titles into short English slugs.

function sanitize(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const STOPWORDS = new Set([
  "the","a","an","and","or","of","in","on","at","to","for","with","by","from",
  "is","are","was","were","be","been","being","that","this","these","those",
  "as","it","its","into","over","after","before","about","up","down","out",
]);

function trimStopwords(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  // keep first 7 meaningful words
  const kept: string[] = [];
  for (const p of parts) {
    if (kept.length >= 8) break;
    if (kept.length === 0 && STOPWORDS.has(p)) continue;
    kept.push(p);
  }
  return kept.join("-").slice(0, 70) || "news";
}

/**
 * Generate a short SEO-friendly English slug from any title (Hindi or English).
 * Falls back to ASCII-sanitised title if AI gateway is unavailable.
 */
export async function generateEnglishSlug(title: string): Promise<string> {
  const trimmed = (title ?? "").trim();
  if (!trimmed) return "news";

  // If already mostly ASCII English, just sanitise.
  const asciiRatio =
    (trimmed.match(/[a-zA-Z]/g)?.length ?? 0) / Math.max(trimmed.length, 1);
  if (asciiRatio > 0.6) {
    const s = trimStopwords(sanitize(trimmed));
    if (s && s !== "news") return s;
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    const fallback = sanitize(trimmed);
    return fallback || "news";
  }

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You convert news article titles (often Hindi) into short SEO-friendly English URL slugs. " +
              "Rules: output ONLY the slug, 3 to 7 lowercase English words separated by hyphens, " +
              "no punctuation, no quotes, no numbers unless essential to meaning, no stopwords at start. " +
              "Capture the core news topic. No explanation.",
          },
          { role: "user", content: trimmed.slice(0, 300) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    const j = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = j.choices?.[0]?.message?.content ?? "";
    const cleaned = trimStopwords(sanitize(raw));
    if (cleaned && cleaned !== "news") return cleaned;
  } catch {
    // fall through to fallback
  }

  const fallback = sanitize(trimmed);
  return fallback || "news";
}

/**
 * Ensure the slug is unique in the news table. If taken, append a short suffix.
 * Pass the existing row id so we don't conflict with the row being updated.
 */
export async function uniqueSlug(
  base: string,
  selfId?: string,
): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let candidate = base.slice(0, 70) || "news";
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data } = await supabaseAdmin
      .from("news")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === selfId) return candidate;
    const suffix = Math.random().toString(36).slice(2, 6);
    candidate = `${base.slice(0, 65)}-${suffix}`;
  }
  return `${base.slice(0, 60)}-${Date.now().toString(36)}`;
}
