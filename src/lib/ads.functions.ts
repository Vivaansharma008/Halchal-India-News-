import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AD_POSITIONS = [
  "header",
  "between_sections",
  "sidebar",
  "in_article",
  "above_footer",
] as const;

export type AdPosition = (typeof AD_POSITIONS)[number];

export type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: AdPosition;
  is_enabled: boolean;
  sort_order: number;
};

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const SELECT = "id, title, image_url, link_url, position, is_enabled, sort_order";

export const listActiveAds = createServerFn({ method: "GET" }).handler(
  async (): Promise<Ad[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("ads")
      .select(SELECT)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Ad[];
  },
);

// ===== Admin =====

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), {
    message: "Only http/https URLs are allowed",
  });

const adInput = z.object({
  title: z.string().trim().min(1).max(200),
  image_url: httpUrl,
  link_url: httpUrl,
  position: z.enum(AD_POSITIONS),
  is_enabled: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

async function assertAdmin(_supabase: unknown, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

export const adminListAds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("ads")
      .select(SELECT)
      .order("position", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Ad[];
  });

export const adminGetAd = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("ads")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as Ad | null;
  });

export const adminCreateAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("ads").insert({
      title: data.title,
      image_url: data.image_url,
      link_url: data.link_url,
      position: data.position,
      is_enabled: data.is_enabled ?? true,
      sort_order: data.sort_order ?? 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    adInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("ads")
      .update({
        title: rest.title,
        image_url: rest.image_url,
        link_url: rest.link_url,
        position: rest.position,
        is_enabled: rest.is_enabled ?? true,
        sort_order: rest.sort_order ?? 0,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_enabled: boolean }) =>
    z.object({ id: z.string().uuid(), is_enabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("ads")
      .update({ is_enabled: data.is_enabled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("ads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
