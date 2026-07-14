import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Eye, User } from "lucide-react";
import type { NewsListItem } from "@/lib/news.functions";
import { CATEGORY_LABELS, type CategorySlug } from "@/lib/categories";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} सेकंड पहले`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} मिनट पहले`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} घंटे पहले`;
  return `${Math.floor(h / 24)} दिन पहले`;
}

function readingTime(item: NewsListItem) {
  const base = (item.summary?.length ?? 0) + (item.title?.length ?? 0);
  return Math.max(2, Math.round(base / 180));
}

type WithMeta = NewsListItem & { author_name?: string | null; view_count?: number | null };

export function NewsCard({
  item,
  variant = "default",
}: {
  item: NewsListItem;
  variant?: "default" | "feature" | "compact";
}) {
  const meta = item as WithMeta;
  const category = CATEGORY_LABELS[item.category as CategorySlug] ?? item.category;
  const img =
    item.image_url ||
    `https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=70&fit=crop`;

  if (variant === "feature") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        whileHover={{ y: -4 }}
      >
        <Link
          to="/news/$slug"
          params={{ slug: item.slug }}
          className="group relative block overflow-hidden rounded-3xl shadow-elevated aspect-[16/11] ring-1 ring-black/5"
        >
          <img
            src={img}
            alt={item.title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow-red">
              {category}
            </span>
            {item.is_breaking && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Breaking
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight line-clamp-3 drop-shadow">
              {item.title}
            </h2>
            {item.summary && (
              <p className="mt-2 text-sm sm:text-base opacity-90 line-clamp-2 max-w-3xl">
                {item.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs opacity-90">
              {meta.author_name && (
                <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{meta.author_name}</span>
              )}
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(item.published_at)}</span>
              <span className="inline-flex items-center gap-1">{readingTime(item)} मिनट पढ़ें</span>
              {typeof meta.view_count === "number" && (
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{meta.view_count.toLocaleString("hi-IN")}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to="/news/$slug"
        params={{ slug: item.slug }}
        className="group flex gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-secondary/60"
      >
        <img
          src={img}
          alt={item.title}
          loading="lazy"
          className="h-20 w-24 sm:w-28 shrink-0 rounded-xl object-cover shadow-card ring-1 ring-black/5"
        />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {category}
          </span>
          <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(item.published_at)}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        to="/news/$slug"
        params={{ slug: item.slug }}
        className="group block h-full overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/[0.04] hover:shadow-float transition-shadow duration-300"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={img}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          />
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-card">
            {category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-display text-base sm:text-lg font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(item.published_at)}</span>
            <span>· {readingTime(item)} मिनट</span>
            {typeof meta.view_count === "number" && (
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{meta.view_count.toLocaleString("hi-IN")}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
