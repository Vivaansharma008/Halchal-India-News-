import { Link } from "@tanstack/react-router";
import type { NewsListItem } from "@/lib/news.functions";

export function BreakingTicker({ items }: { items: NewsListItem[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="bg-breaking text-breaking-foreground border-y border-primary-dark">
      <div className="container-news flex items-stretch gap-0 overflow-hidden">
        <div className="flex items-center gap-2 bg-primary-dark px-4 py-2.5 font-bold text-sm uppercase tracking-wider shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          ब्रेकिंग
        </div>
        <div className="relative flex-1 overflow-hidden py-2.5">
          <div className="animate-ticker flex gap-12 whitespace-nowrap text-sm font-medium">
            {loop.map((n, i) => (
              <Link
                key={`${n.id}-${i}`}
                to="/news/$slug"
                params={{ slug: n.slug }}
                className="hover:underline"
              >
                ● {n.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
