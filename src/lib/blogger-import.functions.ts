import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CATEGORY_VALUES = [
  "politics",
  "sports",
  "entertainment",
  "technology",
  "uttar-pradesh",
] as const;

const PostSchema = z.object({
  source_id: z.string().min(1).max(200),
  source_url: z.string().max(500).optional().nullable(),
  title: z.string().min(1).max(500),
  summary: z.string().max(1000),
  content: z.string().min(1),
  category: z.enum(CATEGORY_VALUES),
  image_url: z.string().max(2000).nullable().optional(),
  author_name: z.string().max(200).nullable().optional(),
  published_at: z.string(),
  slug: z.string().min(1).max(200),
});

const BatchInput = z.object({
  posts: z.array(PostSchema).min(1).max(50),
});

async function isAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export type ImportResultItem = {
  source_id: string;
  status: "imported" | "skipped" | "failed";
  reason?: string;
  slug?: string;
};

export const adminImportBloggerBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BatchInput.parse(d))
  .handler(async ({ data, context }): Promise<{ results: ImportResultItem[] }> => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = data.posts.map((p) => p.source_id);
    const { data: existing } = await supabaseAdmin
      .from("news")
      .select("source_id")
      .in("source_id", ids);
    const existingSet = new Set((existing ?? []).map((r) => r.source_id as string));

    const results: ImportResultItem[] = [];
    const toInsert: Array<Record<string, unknown>> = [];

    const { generateEnglishSlug, uniqueSlug } = await import("@/lib/slug.server");
    const { sanitizeHtml } = await import("@/lib/sanitize-html");

    for (const p of data.posts) {
      if (existingSet.has(p.source_id)) {
        results.push({ source_id: p.source_id, status: "skipped", reason: "duplicate" });
        continue;
      }
      // Always derive a fresh English slug from the title, ignoring caller's Hindi slug.
      const base = await generateEnglishSlug(p.title);
      const slug = await uniqueSlug(base);
      toInsert.push({
        source_id: p.source_id,
        source_url: p.source_url ?? null,
        slug,
        title: p.title.slice(0, 300),
        summary: p.summary.slice(0, 500) || p.title.slice(0, 500),
        content: sanitizeHtml(p.content),
        category: p.category,
        image_url: p.image_url ?? null,
        author_name: p.author_name ?? null,
        is_breaking: false,
        is_published: true,
        published_at: p.published_at,
      });
    }

    if (toInsert.length > 0) {
      // Insert one-by-one to capture per-row errors (slug collisions etc.)
      for (const row of toInsert) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabaseAdmin.from("news").insert(row as any);
        if (error) {
          // retry with random slug suffix on unique violation
          if (error.message.toLowerCase().includes("duplicate")) {
            const retrySlug = `${(row.slug as string).slice(0, 180)}-${Math.random().toString(36).slice(2, 7)}`;
            const { error: e2 } = await supabaseAdmin
              .from("news")
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .insert({ ...row, slug: retrySlug } as any);
            if (e2) {
              results.push({
                source_id: row.source_id as string,
                status: "failed",
                reason: e2.message,
              });
              continue;
            }
            results.push({
              source_id: row.source_id as string,
              status: "imported",
              slug: retrySlug,
            });
            continue;
          }
          results.push({
            source_id: row.source_id as string,
            status: "failed",
            reason: error.message,
          });
        } else {
          results.push({
            source_id: row.source_id as string,
            status: "imported",
            slug: row.slug as string,
          });
        }
      }
    }

    return { results };
  });
