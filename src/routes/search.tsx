import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { searchNews } from "@/lib/news.functions";
import { NewsCard } from "@/components/site/NewsCard";
import { Search } from "lucide-react";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "खोजें — Halchal India " },
      { name: "description", content: "Halchal India  पर समाचार खोजें।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState(q ?? "");

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchNews({ data: { q: q! } }),
    enabled: !!q && q.length > 0,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = term.trim();
    if (!t) return;
    navigate({ search: { q: t } });
  }

  return (
    <div className="container-news py-8">
      <h1 className="text-2xl font-bold">समाचार खोजें</h1>
      <form
        onSubmit={submit}
        className="mt-4 flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-2.5 max-w-2xl"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="जैसे: चुनाव, क्रिकेट, बॉलीवुड..."
          className="w-full bg-transparent outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          खोजें
        </button>
      </form>

      {q && (
        <p className="mt-4 text-sm text-muted-foreground">
          "<span className="font-semibold text-foreground">{q}</span>" के लिए परिणाम
        </p>
      )}

      {isFetching && <p className="mt-6 text-muted-foreground">खोज रहे हैं...</p>}

      {data && data.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">कोई परिणाम नहीं मिला।</p>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  );
}
