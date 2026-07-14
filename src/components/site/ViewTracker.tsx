import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recordNewsView } from "@/lib/views.functions";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "hi_visitor_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function ViewTracker({ newsId }: { newsId: string }) {
  const record = useServerFn(recordNewsView);
  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;
    // Fire-and-forget; ignore errors so a tracking failure never breaks the page.
    record({ data: { newsId, visitorId } }).catch(() => {});
  }, [newsId, record]);
  return null;
}
