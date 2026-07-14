import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://halchalindianews.com";

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let rows: { slug: string; title: string; published_at: string }[] = [];
        try {
          const supabase = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          // Google News sitemap: only articles from the last 48 hours
          const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
          const { data } = await supabase
            .from("news")
            .select("slug, title, published_at")
            .eq("is_published", true)
            .gte("published_at", since)
            .order("published_at", { ascending: false })
            .limit(1000);
          rows = data ?? [];
        } catch {
          // ignore
        }

        const urls = rows.map(
          (r) => `  <url>
    <loc>${BASE_URL}/news/${r.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Halchal India News</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${r.published_at}</news:publication_date>
      <news:title>${r.title.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</news:title>
    </news:news>
  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
