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

const CATS = [
  "politics",
  "india",
  "world",
  "sports",
  "entertainment",
  "technology",
  "business",
  "health",
] as const;

export type VideoListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: (typeof CATS)[number];
  source: "youtube" | "upload";
  youtube_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  is_featured: boolean;
  published_at: string;
  view_count: number;
};

const SELECT_PUBLIC =
  "id, slug, title, description, category, source, youtube_id, video_url, thumbnail_url, duration, is_featured, published_at, view_count";

export const listVideos = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number; category?: string; featured?: boolean }) =>
    z
      .object({
        limit: z.number().int().min(1).max(60).optional(),
        category: z.enum(CATS).optional(),
        featured: z.boolean().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<VideoListItem[]> => {
    const supabase = publicClient();
    let q = supabase
      .from("videos")
      .select(SELECT_PUBLIC)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 24);
    if (data.category) q = q.eq("category", data.category);
    if (data.featured) q = q.eq("is_featured", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as VideoListItem[];
  });

export const getVideoBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<VideoListItem | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("videos")
      .select(SELECT_PUBLIC)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as VideoListItem) ?? null;
  });

// ===== Admin =====

async function isUserAdmin(userId: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

async function assertAdmin(userId: string) {
  if (!(await isUserAdmin(userId))) throw new Error("Forbidden: admin only");
}

const videoInput = z.object({
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().max(2000).nullable().optional(),
  category: z.enum(CATS),
  source: z.enum(["youtube", "upload"]),
  youtube_url: z.string().trim().max(500).nullable().optional(),
  youtube_id: z.string().trim().max(20).nullable().optional(),
  video_url: z.string().trim().max(1000).nullable().optional(),
  thumbnail_url: z.string().trim().max(1000).nullable().optional(),
  duration: z.string().trim().max(20).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "video";
}

async function uniqueVideoSlug(base: string, ignoreId?: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let candidate = base;
  for (let i = 0; i < 20; i++) {
    const { data } = await supabaseAdmin
      .from("videos")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

export const adminListVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await context.supabase
      .from("videos")
      .select(
        "id, slug, title, category, source, is_featured, is_published, published_at, view_count, thumbnail_url",
      )
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetVideo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await context.supabase
      .from("videos")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminCreateVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => videoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = await uniqueVideoSlug(slugify(data.title));
    const { data: row, error } = await context.supabase
      .from("videos")
      .insert({
        slug,
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        source: data.source,
        youtube_url: data.youtube_url ?? null,
        youtube_id: data.youtube_id ?? null,
        video_url: data.video_url ?? null,
        thumbnail_url: data.thumbnail_url ?? null,
        duration: data.duration ?? null,
        is_featured: data.is_featured ?? false,
        is_published: data.is_published ?? true,
        created_by: context.userId,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    videoInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("videos")
      .update({
        title: rest.title,
        description: rest.description ?? null,
        category: rest.category,
        source: rest.source,
        youtube_url: rest.youtube_url ?? null,
        youtube_id: rest.youtube_id ?? null,
        video_url: rest.video_url ?? null,
        thumbnail_url: rest.thumbnail_url ?? null,
        duration: rest.duration ?? null,
        is_featured: rest.is_featured ?? false,
        is_published: rest.is_published ?? true,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("videos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleVideoFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_featured: boolean }) =>
    z.object({ id: z.string().uuid(), is_featured: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase
      .from("videos")
      .update({ is_featured: data.is_featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
