import { Play, Clock } from "lucide-react";
import { VIDEO_CATEGORY_LABELS, type VideoCategorySlug } from "@/lib/videos";
import type { VideoListItem } from "@/lib/videos.functions";

const FALLBACK =
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=70&fit=crop";

export function VideoCard({
  video,
  variant = "grid",
  onPlay,
}: {
  video: VideoListItem;
  variant?: "grid" | "feature";
  onPlay: (v: VideoListItem) => void;
}) {
  const thumb = video.thumbnail_url || FALLBACK;
  const isFeature = variant === "feature";

  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group text-left w-full rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-shadow"
    >
      <div className={`relative w-full ${isFeature ? "aspect-[16/9]" : "aspect-video"} overflow-hidden bg-secondary`}>
        <img
          src={thumb}
          alt={video.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid place-items-center h-14 w-14 rounded-full bg-primary/95 text-primary-foreground shadow-elevated ring-4 ring-white/20 transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </span>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            <Clock className="h-3 w-3" /> {video.duration}
          </span>
        )}
        {video.is_featured && (
          <span className="absolute top-2 left-2 rounded bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Featured
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <span>{VIDEO_CATEGORY_LABELS[video.category as VideoCategorySlug] ?? video.category}</span>
          <span className="text-muted-foreground font-normal normal-case tracking-normal">
            · {new Date(video.published_at).toLocaleDateString("hi-IN")}
          </span>
        </div>
        <h3
          className={`mt-1 font-bold leading-snug group-hover:text-primary transition-colors ${
            isFeature ? "text-lg sm:text-xl line-clamp-3" : "text-sm line-clamp-2"
          }`}
        >
          {video.title}
        </h3>
      </div>
    </button>
  );
}
