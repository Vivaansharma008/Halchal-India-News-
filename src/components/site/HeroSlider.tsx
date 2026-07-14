import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
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

export function HeroSlider({ items }: { items: NewsListItem[] }) {
  const [i, setI] = useState(0);
  const n = items.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;
  const item = items[i];
  const category = CATEGORY_LABELS[item.category as CategorySlug] ?? item.category;
  const img =
    item.image_url ||
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=75&fit=crop";

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-elevated ring-1 ring-black/5 aspect-[16/11]">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Link to="/news/$slug" params={{ slug: item.slug }} className="group block h-full w-full">
            <img src={img} alt={item.title} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.05]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow-red">
                {category}
              </span>
              {item.is_breaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Breaking
                </span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight line-clamp-3 drop-shadow">
                {item.title}
              </h2>
              {item.summary && (
                <p className="mt-2 text-sm sm:text-base opacity-90 line-clamp-2 max-w-3xl">
                  {item.summary}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs opacity-90">
                <Clock className="h-3 w-3" /> {timeAgo(item.published_at)}
              </p>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="पिछला"
            onClick={() => setI((p) => (p - 1 + n) % n)}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass text-white hover:bg-white/30 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="अगला"
            onClick={() => setI((p) => (p + 1) % n)}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass text-white hover:bg-white/30 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {items.map((_, k) => (
              <button
                key={k}
                aria-label={`स्लाइड ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all ${
                  k === i ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
