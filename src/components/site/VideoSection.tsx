import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PlayCircle, ChevronRight } from "lucide-react";
import { listVideos, type VideoListItem } from "@/lib/videos.functions";
import { VideoCard } from "./VideoCard";
import { VideoPlayerDialog } from "./VideoPlayerDialog";

export function VideoSection() {
  const [active, setActive] = useState<VideoListItem | null>(null);
  const { data } = useQuery({
    queryKey: ["videos", "home"],
    queryFn: () => listVideos({ data: { limit: 9 } }),
  });

  if (!data || data.length === 0) return null;

  const featured = data.find((v) => v.is_featured) ?? data[0];
  const rest = data.filter((v) => v.id !== featured.id).slice(0, 6);

  return (
    <section className="container-news py-6">
      <div className="mb-4 flex items-end justify-between border-b-2 border-primary pb-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <PlayCircle className="h-6 w-6 text-primary" />
          वीडियो न्यूज़
        </h2>
        <Link
          to="/videos"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          और वीडियो देखें <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <VideoCard video={featured} variant="feature" onPlay={setActive} />
        </div>
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rest.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActive} />
          ))}
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card hover:bg-primary-dark transition-colors"
        >
          <PlayCircle className="h-4 w-4" /> Watch More Videos
        </Link>
      </div>

      <VideoPlayerDialog video={active} onClose={() => setActive(null)} />
    </section>
  );
}
