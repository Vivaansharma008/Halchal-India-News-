import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

/**
 * Record a view for a news article. Deduplicated per visitor per 24 hours.
 * Called from the article page loader/component. Uses service role via the
 * SECURITY DEFINER RPC so anon visitors can be counted safely.
 */
export const recordNewsView = createServerFn({ method: "POST" })
  .inputValidator((d: { newsId: string; visitorId: string }) =>
    z
      .object({
        newsId: z.string().uuid(),
        visitorId: z.string().min(8).max(128),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Hash visitor id with news id so a visitor id can't be reversed from the DB.
    const enc = new TextEncoder().encode(`${data.newsId}:${data.visitorId}`);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data: counted, error } = await supabaseAdmin.rpc("record_news_view", {
      _news_id: data.newsId,
      _visitor_hash: hash,
    });
    if (error) return { counted: false };
    return { counted: !!counted };
  });

export type AdminNewsWithViews = {
  id: string;
  slug: string;
  title: string;
  category: string;
  is_breaking: boolean;
  is_published: boolean;
  published_at: string;
  view_count: number;
};

export const adminListNewsWithViews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminNewsWithViews[]> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("news")
      .select("id, slug, title, category, is_breaking, is_published, published_at, view_count")
      .order("published_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminNewsWithViews[];
  });

export type ViewAnalytics = {
  total: number;
  today: number;
  week: number;
  top: Array<{ id: string; slug: string; title: string; view_count: number }>;
};

export const adminViewAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ViewAnalytics> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const startToday = new Date(now);
    startToday.setUTCHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalRes, todayRes, weekRes, topRes] = await Promise.all([
      supabaseAdmin.from("news_views").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("news_views")
        .select("id", { count: "exact", head: true })
        .gte("viewed_at", startToday.toISOString()),
      supabaseAdmin
        .from("news_views")
        .select("id", { count: "exact", head: true })
        .gte("viewed_at", weekAgo.toISOString()),
      supabaseAdmin
        .from("news")
        .select("id, slug, title, view_count")
        .order("view_count", { ascending: false })
        .limit(10),
    ]);

    return {
      total: totalRes.count ?? 0,
      today: todayRes.count ?? 0,
      week: weekRes.count ?? 0,
      top: (topRes.data ?? []) as ViewAnalytics["top"],
    };
  });
