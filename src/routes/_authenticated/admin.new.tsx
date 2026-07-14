import { createFileRoute } from "@tanstack/react-router";
import { NewsForm } from "@/components/admin/NewsForm";

export const Route = createFileRoute("/_authenticated/admin/new")({
  head: () => ({
    meta: [{ title: "नया समाचार — Halchal India " }, { name: "robots", content: "noindex" }],
  }),
  component: () => <NewsForm />,
});
