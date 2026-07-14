import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Eye, ArrowLeft } from "lucide-react";
import {
  adminListVideos,
  adminDeleteVideo,
  adminToggleVideoFeatured,
} from "@/lib/videos.functions";
import { VIDEO_CATEGORY_LABELS, type VideoCategorySlug } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/admin/videos/")({
  head: () => ({
    meta: [
      { title: "Video Manager — Halchal India" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminVideos,
});

function AdminVideos() {
  const listFn = useServerFn(adminListVideos);
  const delFn = useServerFn(adminDeleteVideo);
  const toggleFn = useServerFn(adminToggleVideoFeatured);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: () => listFn(),
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" हटाएँ?`)) return;
    try {
      await delFn({ data: { id } });
      toast.success("वीडियो हटा दिया गया");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "त्रुटि");
    }
  }

  async function handleToggleFeature(id: string, current: boolean) {
    try {
      await toggleFn({ data: { id, is_featured: !current } });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "त्रुटि");
    }
  }

  return (
    <div className="container-news py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Video Manager</h1>
            <p className="text-sm text-muted-foreground">
              YouTube और अपलोड किए गए वीडियो प्रबंधित करें
            </p>
          </div>
        </div>
        <Link
          to="/admin/videos/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> नया वीडियो
        </Link>
      </div>

      {isLoading ? (
        <p className="py-12 text-center">लोड हो रहा है...</p>
      ) : !data || data.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          अभी कोई वीडियो नहीं है।
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-3 py-3 font-semibold">Thumb</th>
                <th className="px-3 py-3 font-semibold">शीर्षक</th>
                <th className="px-3 py-3 font-semibold">श्रेणी</th>
                <th className="px-3 py-3 font-semibold">स्रोत</th>
                <th className="px-3 py-3 font-semibold">व्यूज़</th>
                <th className="px-3 py-3 font-semibold">तारीख</th>
                <th className="px-3 py-3 font-semibold text-right">क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt=""
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-16 rounded bg-muted" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium max-w-sm">
                    <div className="truncate">{v.title}</div>
                    {v.is_featured && (
                      <span className="mt-0.5 inline-block rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {VIDEO_CATEGORY_LABELS[v.category as VideoCategorySlug] ?? v.category}
                  </td>
                  <td className="px-3 py-2 uppercase text-[11px] font-bold">
                    {v.source}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {(v.view_count ?? 0).toLocaleString("hi-IN")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(v.published_at).toLocaleDateString("hi-IN")}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggleFeature(v.id, v.is_featured)}
                        className={`grid h-8 w-8 place-items-center rounded hover:bg-accent ${
                          v.is_featured ? "text-primary" : ""
                        }`}
                        title={v.is_featured ? "Unfeature" : "Feature"}
                      >
                        <Star
                          className={`h-4 w-4 ${v.is_featured ? "fill-current" : ""}`}
                        />
                      </button>
                      <Link
                        to="/admin/videos/edit/$id"
                        params={{ id: v.id }}
                        className="grid h-8 w-8 place-items-center rounded hover:bg-accent"
                        title="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id, v.title)}
                        className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-destructive/10"
                        title="हटाएँ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
