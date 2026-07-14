import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listLatestNews } from "@/lib/news.functions";
import { NewsCard } from "@/components/site/NewsCard";
import { CATEGORY_LABELS, isValidCategory, type CategorySlug } from "@/lib/categories";

function opts(category: CategorySlug) {
  return queryOptions({
    queryKey: ["news", "category", category],
    queryFn: () => listLatestNews({ data: { category, limit: 30 } }),
  });
}

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => {
    const label = isValidCategory(params.category)
      ? CATEGORY_LABELS[params.category]
      : "श्रेणी";
    return {
      meta: [
        { title: `${label} समाचार — Halchal India ` },
        {
          name: "description",
          content: `${label} से जुड़ी ताज़ा और विश्वसनीय हिंदी खबरें पढ़ें Halchal India  पर।`,
        },
        { property: "og:title", content: `${label} समाचार — Halchal India ` },
        { property: "og:url", content: `/category/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.category}` }],
    };
  },
  loader: ({ params, context }) => {
    if (!isValidCategory(params.category)) throw notFound();
    return context.queryClient.ensureQueryData(opts(params.category));
  },
  notFoundComponent: () => (
    <div className="container-news py-20 text-center">
      <h1 className="text-2xl font-bold">श्रेणी नहीं मिली</h1>
    </div>
  ),
  errorComponent: () => (
    <div className="container-news py-20 text-center text-destructive">
      समाचार लोड नहीं हो सका। कृपया पुनः प्रयास करें।
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  if (!isValidCategory(category)) return null;
  return (
    <Suspense fallback={<div className="container-news py-12">लोड हो रहा है...</div>}>
      <CategoryContent category={category} />
    </Suspense>
  );
}

function CategoryContent({ category }: { category: CategorySlug }) {
  const { data } = useSuspenseQuery(opts(category));
  return (
    <div className="container-news py-8">
      <div className="mb-6 border-b-2 border-primary pb-2">
        <h1 className="text-3xl font-bold">{CATEGORY_LABELS[category]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} समाचार उपलब्ध
        </p>
      </div>
      {data.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          इस श्रेणी में अभी कोई समाचार नहीं है।
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  );
}
