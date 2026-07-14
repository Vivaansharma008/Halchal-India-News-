import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, PlayCircle } from "lucide-react";
import { listVideos, type VideoListItem } from "@/lib/videos.functions";
import { VideoCard } from "@/components/site/VideoCard";
import { VideoPlayerDialog } from "@/components/site/VideoPlayerDialog";
import { VIDEO_CATEGORIES, type VideoCategorySlug } from "@/lib/videos";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "वीडियो न्यूज़ — Halchal India" },
      {
        name: "description",
        content: "ताज़ा हिंदी वीडियो समाचार — राजनीति, खेल, मनोरंजन, विश्व और अधिक।",
      },
      { property: "og:title", content: "वीडियो न्यूज़ — Halchal India" },
      {
        property: "og:description",
        content: "ताज़ा हिंदी वीडियो समाचार — राजनीति, खेल, मनोरंजन, विश्व और अधिक।",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  const [active, setActive] = useState<VideoListItem | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<VideoCategorySlug | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["videos", "all"],
    queryFn: () => listVideos({ data: { limit: 60 } }),
  });

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (cat !== "all") rows = rows.filter((v) => v.category === cat);
    const term = q.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          (v.description ?? "").toLowerCase().includes(term),
      );
    }
    return rows;
  }, [data, cat, q]);

  const featured = (data ?? []).filter((v) => v.is_featured).slice(0, 3);

  return (
    <div className="container-news py-6">
      <div className="mb-6 flex items-center gap-2">
        <PlayCircle className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">वीडियो न्यूज़</h1>
      </div>

      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
            Featured Videos
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((v) => (
              <VideoCard key={v.id} video={v} variant="feature" onPlay={setActive} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
            सभी
          </FilterChip>
          {VIDEO_CATEGORIES.map((c) => (
            <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
        <label className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:w-64">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="वीडियो खोजें..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">लोड हो रहा है...</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">कोई वीडियो नहीं मिला।</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActive} />
          ))}
        </div>
      )}

      <VideoPlayerDialog video={active} onClose={() => setActive(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground border border-border hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
