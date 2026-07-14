import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listLatestNews, listBreakingNews, type NewsListItem } from "@/lib/news.functions";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { NewsCard } from "@/components/site/NewsCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { AdSlot } from "@/components/site/AdSlot";
import { VideoSection } from "@/components/site/VideoSection";
import { CATEGORIES, CATEGORY_LABELS, type CategorySlug } from "@/lib/categories";
import { Clock, ChevronRight, TrendingUp, Newspaper, Trophy, Film, Cpu, MapPin, Briefcase, GraduationCap, HeartPulse, Globe2, Car, ShieldCheck, Sparkles } from "lucide-react";

const latestOpts = queryOptions({
  queryKey: ["news", "latest"],
  queryFn: () => listLatestNews({ data: { limit: 40 } }),
});
const breakingOpts = queryOptions({
  queryKey: ["news", "breaking"],
  queryFn: () => listBreakingNews(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halchal India — ताज़ा हिंदी समाचार" },
      {
        name: "description",
        content:
          "भारत की ताज़ा खबरें, ब्रेकिंग न्यूज़, राजनीति, खेल, मनोरंजन और तकनीक एक ही जगह।",
      },
      { property: "og:title", content: "Halchal India — ताज़ा हिंदी समाचार" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(latestOpts),
      context.queryClient.ensureQueryData(breakingOpts),
    ]),
  component: HomePage,
});

function HomePage() {
  return (
    <Suspense fallback={<div className="container-news py-12">लोड हो रहा है...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} सेकंड पहले`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} मिनट पहले`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} घंटे पहले`;
  return `${Math.floor(h / 24)} दिन पहले`;
}

function HomeContent() {
  const { data: latest } = useSuspenseQuery(latestOpts);
  const { data: breaking } = useSuspenseQuery(breakingOpts);

  if (latest.length === 0) {
    return (
      <>
        <BreakingTicker items={[]} />
        <div className="container-news py-20 text-center">
          <h2 className="text-2xl font-bold">अभी कोई समाचार उपलब्ध नहीं है</h2>
          <p className="mt-2 text-muted-foreground">
            एडमिन के रूप में लॉगिन करके पहली खबर प्रकाशित करें।
          </p>
        </div>
      </>
    );
  }

  const heroItems = latest.slice(0, 5);
  const middleList = latest.slice(1, 5);
  const tazaList = latest.slice(0, 5);

  // Group remaining items by category for the category strips
  const used = new Set(latest.slice(0, 5).map((n) => n.id));
  const byCategory: Record<string, NewsListItem[]> = {};
  for (const item of latest) {
    if (used.has(item.id)) continue;
    (byCategory[item.category] ||= []).push(item);
  }

  return (
    <>
      <BreakingTicker items={breaking.length ? breaking : latest.slice(0, 5)} />

      {/* HERO: 3 columns with auto-cycling slider */}
      <section className="container-news py-6">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left: Hero slider */}
          <div className="lg:col-span-6 space-y-3">
            <SectionLabel>मुख्य समाचार</SectionLabel>
            <HeroSlider items={heroItems} />
          </div>

          {/* Middle: 4 thumbnail rows */}
          <div className="lg:col-span-3 space-y-3">
            <SectionLabel className="invisible hidden lg:block">_</SectionLabel>
            <div className="rounded-2xl bg-card shadow-card divide-y divide-border overflow-hidden">
              {middleList.map((n) => (
                <Link
                  key={n.id}
                  to="/news/$slug"
                  params={{ slug: n.slug }}
                  className="group flex gap-3 p-3 hover:bg-secondary/60 transition-colors"
                >
                  <img
                    src={
                      n.image_url ||
                      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=70&fit=crop"
                    }
                    alt={n.title}
                    loading="lazy"
                    className="h-20 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                      {n.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeAgo(n.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: ताज़ा खबरें panel + ad */}
          <aside className="lg:col-span-3 space-y-4">
            <SectionLabel className="invisible hidden lg:block">_</SectionLabel>
            <div className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-2.5 font-bold text-sm tracking-wide">
                ताज़ा खबरें
              </div>
              <ul className="p-2">
                {tazaList.map((n) => (
                  <li key={n.id}>
                    <Link
                      to="/news/$slug"
                      params={{ slug: n.slug }}
                      className="flex gap-2 rounded-lg p-2 text-sm hover:bg-secondary/60 transition-colors group"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {n.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <AdSlot position="sidebar" variant="sidebar" label="Advertisement" />
          </aside>
        </div>
      </section>

      <div className="container-news">
        <AdSlot position="between_sections" variant="banner" label="Advertisement" />
      </div>

      {/* 3D CATEGORY BENTO */}
      <section className="container-news py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Explore
            </p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              श्रेणी अनुसार पढ़ें
            </h2>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 10).map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? Newspaper;
            return (
              <Link
                key={c.slug}
                to="/category/$category"
                params={{ category: c.slug }}
                className="group relative overflow-hidden rounded-2xl bg-card p-4 shadow-card ring-1 ring-black/[0.04] hover:shadow-float hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/15 transition" />
                <div className="relative flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/90 to-primary-dark text-primary-foreground shadow-glow-red group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm truncate">{c.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">पढ़ें →</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <VideoSection />




      {/* CATEGORY STRIPS */}
      {CATEGORIES.map((cat) => {
        const items = (byCategory[cat.slug] || []).slice(0, 4);
        if (items.length === 0) return null;
        return (
          <section key={cat.slug} className="container-news py-6">
            <div className="mb-4 flex items-end justify-between border-b-2 border-primary pb-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <span className="inline-block h-5 w-1.5 bg-primary rounded-sm" />
                {CATEGORY_LABELS[cat.slug as CategorySlug]}
              </h2>
              <Link
                to="/category/$category"
                params={{ category: cat.slug }}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                और देखें <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {items.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="container-news">
        <AdSlot
          position="between_sections"
          index={1}
          variant="banner"
          label="Sponsored"
        />
      </div>
    </>
  );
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  national: Newspaper,
  "uttar-pradesh": MapPin,
  politics: TrendingUp,
  crime: ShieldCheck,
  sports: Trophy,
  entertainment: Film,
  business: Briefcase,
  technology: Cpu,
  education: GraduationCap,
  health: HeartPulse,
  world: Globe2,
  auto: Car,
};


function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-block ${className}`}>
      <span className="inline-block bg-primary text-primary-foreground px-3 py-1 text-xs font-bold tracking-wide rounded-md">
        {children}
      </span>
    </div>
  );
}
