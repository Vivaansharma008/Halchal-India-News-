import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  getNewsBySlug,
  listLatestNews,
  listRelatedNews,
  getSlugRedirect,
} from "@/lib/news.functions";
import { NewsCard } from "@/components/site/NewsCard";
import { AdSlot, ArticleBodyWithAds } from "@/components/site/AdSlot";
import { ShareButtons } from "@/components/site/ShareButtons";
import { ViewTracker } from "@/components/site/ViewTracker";
import { CATEGORY_LABELS, type CategorySlug } from "@/lib/categories";

const SITE_URL = "https://halchalindianews.com";

function opts(slug: string) {
  return queryOptions({
    queryKey: ["news", "detail", slug],
    queryFn: () => getNewsBySlug({ data: { slug } }),
  });
}
const moreOpts = queryOptions({
  queryKey: ["news", "more"],
  queryFn: () => listLatestNews({ data: { limit: 6 } }),
});
function relatedOpts(category: string, excludeSlug: string) {
  return queryOptions({
    queryKey: ["news", "related", category, excludeSlug],
    queryFn: () =>
      listRelatedNews({ data: { category, excludeSlug, limit: 4 } }),
  });
}

type LoaderPost = Awaited<ReturnType<typeof getNewsBySlug>>;

export const Route = createFileRoute("/news/$slug")({
  head: ({ loaderData }: { loaderData?: LoaderPost }) => {
    const post = loaderData ?? null;
    if (!post) {
      return { meta: [{ title: "समाचार नहीं मिला — Halchal India" }] };
    }
    const url = `${SITE_URL}/news/${post.slug}`;
    const author = (post as { author_name?: string | null }).author_name || "Sushil Sharma";
    const categoryLabel =
      CATEGORY_LABELS[post.category as CategorySlug] ?? post.category;
    return {
      meta: [
        { title: `${post.title} — Halchal India News` },
        { name: "description", content: post.summary },
        { name: "author", content: author },
        { name: "keywords", content: `${post.title}, ${categoryLabel}, Halchal India News, हिंदी समाचार` },
        { property: "og:site_name", content: "Halchal India News" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "hi_IN" },
        { property: "article:published_time", content: post.published_at },
        { property: "article:modified_time", content: (post as { updated_at?: string }).updated_at ?? post.published_at },
        { property: "article:author", content: author },
        { property: "article:section", content: categoryLabel },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.summary },
        ...(post.image_url
          ? [
              { property: "og:image", content: post.image_url },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
              { property: "og:image:alt", content: post.title },
              { name: "twitter:image", content: post.image_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: post.title,
            description: post.summary,
            image: post.image_url ? [post.image_url] : undefined,
            datePublished: post.published_at,
            dateModified: (post as { updated_at?: string }).updated_at ?? post.published_at,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Person", name: author, url: `${SITE_URL}/author/${author.toLowerCase().replace(/\s+/g, "-")}` },
            publisher: {
              "@type": "Organization",
              name: "Halchal India News",
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
            },
            articleSection: categoryLabel,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: categoryLabel, item: `${SITE_URL}/category/${post.category}` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(opts(params.slug));
    if (!post) {
      const target = await getSlugRedirect({ data: { slug: params.slug } });
      if (target && target !== params.slug) {
        throw redirect({
          to: "/news/$slug",
          params: { slug: target },
          statusCode: 301,
        });
      }
      throw notFound();
    }
    await Promise.all([
      context.queryClient.ensureQueryData(moreOpts),
      context.queryClient.ensureQueryData(relatedOpts(post.category, post.slug)),
    ]);
    return post;
  },
  notFoundComponent: () => (
    <div className="container-news py-20 text-center">
      <h1 className="text-2xl font-bold">समाचार नहीं मिला</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        होम पर जाएँ
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-news py-20 text-center text-destructive">
      समाचार लोड नहीं हो सका। कृपया पुनः प्रयास करें।
    </div>
  ),
  component: NewsPage,
});

function NewsPage() {
  const { slug } = Route.useParams();
  return (
    <Suspense
      fallback={<div className="container-news py-12">लोड हो रहा है...</div>}
    >
      <NewsContent slug={slug} />
    </Suspense>
  );
}

function NewsContent({ slug }: { slug: string }) {
  const { data: post } = useSuspenseQuery(opts(slug));
  const { data: more } = useSuspenseQuery(moreOpts);
  if (!post) return null;
  const { data: related } = useSuspenseQuery(
    relatedOpts(post.category, post.slug),
  );

  const category =
    CATEGORY_LABELS[post.category as CategorySlug] ?? post.category;
  const shareUrl = `${SITE_URL}/news/${post.slug}`;

  return (
    <article className="container-news py-8 grid gap-8 lg:grid-cols-3">
      <ViewTracker newsId={post.id} />
      <div className="lg:col-span-2 min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            होम
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            to="/category/$category"
            params={{ category: post.category as CategorySlug }}
            className="font-semibold text-primary"
          >
            {category}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground line-clamp-1" aria-current="page">{post.title}</span>
        </nav>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
          {post.title}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            By {(post as { author_name?: string | null }).author_name || "Sushil Sharma"}
          </span>
          <span>•</span>
          <time dateTime={post.published_at}>
            प्रकाशित: {new Date(post.published_at).toLocaleString("hi-IN", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </time>
          {(post as { updated_at?: string }).updated_at &&
            (post as { updated_at?: string }).updated_at !== post.published_at && (
              <>
                <span>•</span>
                <time dateTime={(post as { updated_at?: string }).updated_at}>
                  अपडेट: {new Date((post as { updated_at?: string }).updated_at!).toLocaleString("hi-IN", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </time>
              </>
            )}
          <span>•</span>
          <span>
            {Math.max(1, Math.round((post.content || "").replace(/<[^>]+>/g, "").split(/\s+/).length / 200))} min read
          </span>
        </p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            loading="eager"
            fetchPriority="high"
            className="mt-5 w-full rounded-lg object-cover aspect-[16/9] shadow-card"
          />
        )}
        <p className="mt-5 text-lg leading-relaxed font-medium text-foreground/90 border-l-4 border-primary pl-4">
          {post.summary}
        </p>
        <ShareButtons url={shareUrl} title={post.title} />
        <ArticleBodyWithAds content={post.content} every={3} />
        <ShareButtons url={shareUrl} title={post.title} />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <span className="text-muted-foreground">
            क्या आपको इस लेख में कोई त्रुटि मिली?
          </span>
          <a
            href={`mailto:halchalindianews24@gmail.com?subject=${encodeURIComponent(
              "Report an Error — " + post.title,
            )}&body=${encodeURIComponent(
              `Article: ${shareUrl}\n\nPlease describe the error:\n`,
            )}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            🚩 Report an Error
          </a>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold">
              संबंधित ख़बरें
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <NewsCard key={r.id} item={r} />
              ))}
            </div>
          </section>
        )}
      </div>
      <aside className="space-y-4">
        <div className="sticky top-44 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 border-b-2 border-primary pb-2 text-lg font-bold">
              और पढ़ें
            </h2>
            <div className="space-y-3">
              {more
                .filter((m) => m.slug !== post.slug)
                .slice(0, 5)
                .map((m) => (
                  <NewsCard key={m.id} item={m} variant="compact" />
                ))}
            </div>
          </div>
          <AdSlot position="sidebar" variant="sidebar" label="Advertisement" />
        </div>
      </aside>
    </article>
  );
}
