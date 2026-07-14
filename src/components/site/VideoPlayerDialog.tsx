import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { youtubeEmbedUrl } from "@/lib/videos";
import type { VideoListItem } from "@/lib/videos.functions";

export function VideoPlayerDialog({
  video,
  onClose,
}: {
  video: VideoListItem | null;
  onClose: () => void;
}) {
  const open = !!video;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black border-black">
        <DialogTitle className="sr-only">{video?.title ?? "Video"}</DialogTitle>
        {video && (
          <>
            <div className="relative w-full aspect-video bg-black">
              {video.source === "youtube" && video.youtube_id ? (
                <iframe
                  key={video.id}
                  src={youtubeEmbedUrl(video.youtube_id)}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : video.video_url ? (
                <video
                  key={video.id}
                  src={video.video_url}
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="grid place-items-center h-full text-white/70 text-sm">
                  Video unavailable
                </div>
              )}
            </div>
            <div className="bg-card text-card-foreground px-4 py-3">
              <h3 className="font-bold text-base sm:text-lg leading-snug">{video.title}</h3>
              {video.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                  {video.description}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
