import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetNews } from "@/lib/news.functions";
import { NewsForm } from "@/components/admin/NewsForm";

export const Route = createFileRoute("/_authenticated/admin/edit/$id")({
  head: () => ({
    meta: [
      { title: "समाचार संपादित करें — Halchal India " },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetNews);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "news", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) return <div className="container-news py-12">लोड हो रहा है...</div>;
  if (!data) return <div className="container-news py-12">समाचार नहीं मिला</div>;

  return <NewsForm newsId={id} initial={data} />;
}
