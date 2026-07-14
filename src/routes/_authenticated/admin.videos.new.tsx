import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { VideoForm } from "@/components/admin/VideoForm";

export const Route = createFileRoute("/_authenticated/admin/videos/new")({
  head: () => ({
    meta: [
      { title: "नया वीडियो — Halchal India" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewVideoPage,
});

function NewVideoPage() {
  return (
    <div className="container-news py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/admin/videos"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">नया वीडियो जोड़ें</h1>
      </div>
      <VideoForm />
    </div>
  );
}
