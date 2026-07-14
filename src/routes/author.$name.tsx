import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { NewsCard } from "@/components/site/NewsCard";

const SITE_URL = "https://halchalindianews.com";

const listByAuthor = createServerFn({ method: "GET" })
  .inputValidator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    const sb = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const display = data.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const { data: rows } = await sb
      .from("news")
      .select("id, slug, title, summary, image_url, category, published_at")
      .eq("is_published", true)
      .ilike("author_name", display)
      .order("published_at", { ascending: false })
      .limit(50);
    return { display, items: rows ?? [] };
  });

function opts(name: string) {
  return queryOptions({
    queryKey: ["author", name],
    queryFn: () => listByAuthor({ data: { name } }),
  });
}

export const Route = createFileRoute("/author/$name")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(opts(params.name)),
  head: ({ params }) => {
    const display = params.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const url = `${SITE_URL}/author/${params.name}`;
    return {
      meta: [
        { title: `${display} — Author at Halchal India News` },
        { name: "description", content: `Read latest news articles by ${display} on Halchal India News.` },
        { property: "og:title", content: `${display} — Halchal India News` },
        { property: "og:description", content: `Articles by ${display}` },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: () => <div className="container-news py-20 text-center">लोड नहीं हो सका।</div>,
  component: () => (
    <Suspense fallback={<div className="container-news py-12">लोड हो रहा है...</div>}>
      <AuthorPage />
    </Suspense>
  ),
});

function AuthorPage() {
  const { name } = Route.useParams();
  const { data } = useSuspenseQuery(opts(name));
  return (
    <div className="container-news py-8">
      <header className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
            {data.display.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{data.display}</h1>
            <p className="text-sm text-muted-foreground">Senior Reporter, Halchal India News</p>
          </div>
        </div>
      </header>
      <h2 className="mt-8 mb-4 border-b-2 border-primary pb-2 text-xl font-bold">
        लेख ({data.items.length})
      </h2>
      {data.items.length === 0 ? (
        <p className="text-muted-foreground">कोई लेख नहीं मिला।</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <NewsCard key={item.id} item={item as Parameters<typeof NewsCard>[0]["item"]} />
          ))}
        </div>
      )}
      <p className="mt-8 text-sm">
        <Link to="/" className="text-primary underline">← होम पर वापस</Link>
      </p>
    </div>
  );
}
