import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetAd } from "@/lib/ads.functions";
import { AdForm } from "@/components/admin/AdForm";

export const Route = createFileRoute("/_authenticated/admin/ads/edit/$id")({
  head: () => ({
    meta: [
      { title: "विज्ञापन संपादित करें — Halchal India " },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditAd,
});

function EditAd() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetAd);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "ad", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) return <div className="container-news py-12">Loading…</div>;
  if (!data)
    return <div className="container-news py-12">Ad not found.</div>;
  return <AdForm initial={data} adId={id} />;
}
