import { createFileRoute } from "@tanstack/react-router";
import { AdForm } from "@/components/admin/AdForm";

export const Route = createFileRoute("/_authenticated/admin/ads/new")({
  head: () => ({
    meta: [
      { title: "नया विज्ञापन — Halchal India " },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdForm />,
});
