import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const SELECT_PUBLIC =
  "id, slug, title, summary, image_url, category, is_breaking, published_at";

export type NewsListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image_url: string | null;
  category: string;
  is_breaking: boolean;
  published_at: string;
};

export type NewsDetail = NewsListItem & { content: string };

const CATEGORY_VALUES = [
  "politics",
  "sports",
  "entertainment",
  "technology",
  "uttar-pradesh",
] as const;

export const listLatestNews = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number; category?: string }) =>
    z
      .object({
        limit: z.number().int().min(1).max(50).optional(),
        category: z.enum(CATEGORY_VALUES).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<NewsListItem[]> => {
    const supabase = publicClient();
    let q = supabase
      .from("news")
      .select(SELECT_PUBLIC)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(data.limit ?? 20);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsListItem[];
  });

export const listBreakingNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsListItem[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("news")
      .select(SELECT_PUBLIC)
      .eq("is_published", true)
      .eq("is_breaking", true)
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []) as NewsListItem[];
  },
);

export const getNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<NewsDetail | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("news")
      .select(`${SELECT_PUBLIC}, content`)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as NewsDetail) ?? null;
  });

export const listRelatedNews = createServerFn({ method: "GET" })
  .inputValidator((d: { category: string; excludeSlug: string; limit?: number }) =>
    z
      .object({
        category: z.enum(CATEGORY_VALUES),
        excludeSlug: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(12).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<NewsListItem[]> => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase
      .from("news")
      .select(SELECT_PUBLIC)
      .eq("is_published", true)
      .eq("category", data.category)
      .neq("slug", data.excludeSlug)
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 4);
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsListItem[];
  });

export const searchNews = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) =>
    z.object({ q: z.string().trim().min(1).max(100) }).parse(d),
  )
  .handler(async ({ data }): Promise<NewsListItem[]> => {
    const supabase = publicClient();
    const term = data.q.replace(/[%_]/g, "\\$&");
    const { data: rows, error } = await supabase
      .from("news")
      .select(SELECT_PUBLIC)
      .eq("is_published", true)
      .or(`title.ilike.%${term}%,summary.ilike.%${term}%`)
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsListItem[];
  });

// ===== Admin =====

const newsInput = z.object({
  title: z.string().trim().min(3).max(300),
  summary: z.string().trim().min(3).max(500),
  content: z.string().trim().min(3).max(20000),
  category: z.enum(CATEGORY_VALUES),
  image_url: z.string().url().nullable().optional(),
  is_breaking: z.boolean().optional(),
  is_published: z.boolean().optional(),
});


async function isUserAdmin(userId: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

async function assertAdmin(_supabase: unknown, userId: string) {
  if (!(await isUserAdmin(userId))) throw new Error("Forbidden: admin only");
}

export const adminListAllNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("news")
      .select("id, slug, title, category, is_breaking, is_published, published_at")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("news")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminCreateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => newsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { generateEnglishSlug, uniqueSlug } = await import("@/lib/slug.server");
    const base = await generateEnglishSlug(data.title);
    const slug = await uniqueSlug(base);
    const { data: row, error } = await context.supabase
      .from("news")
      .insert({
        slug,
        title: data.title,
        summary: data.summary,
        content: data.content,
        category: data.category,
        image_url: data.image_url ?? null,
        is_breaking: data.is_breaking ?? false,
        is_published: data.is_published ?? true,
        author_id: context.userId,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    newsInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { id, ...rest } = data;

    // Regenerate slug if the title changed; record a 301 redirect from the old slug.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current } = await supabaseAdmin
      .from("news")
      .select("slug, title")
      .eq("id", id)
      .maybeSingle();

    let nextSlug = current?.slug as string | undefined;
    if (current && current.title !== rest.title) {
      const { generateEnglishSlug, uniqueSlug } = await import("@/lib/slug.server");
      const base = await generateEnglishSlug(rest.title);
      const newSlug = await uniqueSlug(base, id);
      if (newSlug !== current.slug) {
        await supabaseAdmin
          .from("slug_redirects")
          .upsert({ old_slug: current.slug, new_slug: newSlug });
        nextSlug = newSlug;
      }
    }

    const { error } = await context.supabase
      .from("news")
      .update({
        title: rest.title,
        summary: rest.summary,
        content: rest.content,
        category: rest.category,
        image_url: rest.image_url ?? null,
        is_breaking: rest.is_breaking ?? false,
        is_published: rest.is_published ?? true,
        ...(nextSlug && nextSlug !== current?.slug ? { slug: nextSlug } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true, slug: nextSlug };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await isUserAdmin(context.userId) };
  });

export const getSlugRedirect = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(300) }).parse(d),
  )
  .handler(async ({ data }): Promise<string | null> => {
    const supabase = publicClient();
    // Resolve chained redirects (old -> mid -> new), max 5 hops.
    let current = data.slug;
    for (let i = 0; i < 5; i++) {
      const { data: row } = await supabase
        .from("slug_redirects")
        .select("new_slug")
        .eq("old_slug", current)
        .maybeSingle();
      if (!row) return i === 0 ? null : current;
      current = row.new_slug as string;
    }
    return current;
  });

export const adminBackfillSlugs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) =>
    z.object({ limit: z.number().int().min(1).max(100).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateEnglishSlug, uniqueSlug } = await import("@/lib/slug.server");

    // A "garbage" slug: contains non-ASCII, OR mostly hyphens/digits with fewer than 3 letter chars.
    const limit = data.limit ?? 25;
    const { data: rows, error } = await supabaseAdmin
      .from("news")
      .select("id, slug, title")
      .order("published_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    const needsFix = (rows ?? []).filter((r) => {
      const s = String(r.slug ?? "");
      if (/[^\x20-\x7E]/.test(s)) return true; // non-ASCII
      const letters = (s.match(/[a-z]/gi) ?? []).length;
      return letters < 6;
    }).slice(0, limit);

    let updated = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const row of needsFix) {
      try {
        const base = await generateEnglishSlug(row.title as string);
        const next = await uniqueSlug(base, row.id as string);
        if (next === row.slug) { skipped++; continue; }
        const { error: upErr } = await supabaseAdmin
          .from("news")
          .update({ slug: next })
          .eq("id", row.id);
        if (upErr) throw new Error(upErr.message);
        await supabaseAdmin
          .from("slug_redirects")
          .upsert({ old_slug: row.slug as string, new_slug: next });
        updated++;
      } catch (e) {
        errors.push({ id: row.id as string, error: e instanceof Error ? e.message : String(e) });
      }
    }

    const { count: remaining } = await supabaseAdmin
      .from("news")
      .select("id", { count: "exact", head: true });

    return {
      processed: needsFix.length,
      updated,
      skipped,
      remaining: remaining ?? 0,
      candidates_left: Math.max(0, (rows?.length ?? 0) - needsFix.length),
      errors,
    };
  });
