import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { adminGetVideo } from "@/lib/videos.functions";
import { VideoForm } from "@/components/admin/VideoForm";

export const Route = createFileRoute("/_authenticated/admin/videos/edit/$id")({
  head: () => ({
    meta: [
      { title: "वीडियो संपादित करें — Halchal India" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditVideoPage,
});

function EditVideoPage() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetVideo);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "video", id],
    queryFn: () => getFn({ data: { id } }),
  });

  return (
    <div className="container-news py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/admin/videos"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">वीडियो संपादित करें</h1>
      </div>
      {isLoading ? (
        <p>लोड हो रहा है...</p>
      ) : !data ? (
        <p className="text-muted-foreground">वीडियो नहीं मिला।</p>
      ) : (
        <VideoForm
          initial={{
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            source: data.source,
            youtube_url: data.youtube_url,
            youtube_id: data.youtube_id,
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url,
            duration: data.duration,
            is_featured: data.is_featured,
            is_published: data.is_published,
          }}
        />
      )}
    </div>
  );
}
