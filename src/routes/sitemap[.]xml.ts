import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://halchalindianews.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        type Entry = { path: string; lastmod?: string };
        const staticEntries: Entry[] = [
          { path: "/" },
          { path: "/about" },
          { path: "/contact" },
          { path: "/privacy" },
          { path: "/terms" },
          { path: "/disclaimer" },
          { path: "/editorial-policy" },
          { path: "/corrections-policy" },
          { path: "/fact-checking-policy" },
          { path: "/videos" },
          { path: "/category/politics" },
          { path: "/category/sports" },
          { path: "/category/entertainment" },
          { path: "/category/technology" },
          { path: "/category/uttar-pradesh" },
        ];

        let dynamicEntries: Entry[] = [];
        try {
          const supabase = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await supabase
            .from("news")
            .select("slug, updated_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(500);
          dynamicEntries = (data ?? []).map((n) => ({
            path: `/news/${n.slug}`,
            lastmod: n.updated_at,
          }));
        } catch {
          // ignore
        }

        const all = [...staticEntries, ...dynamicEntries];
        const urls = all.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

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
