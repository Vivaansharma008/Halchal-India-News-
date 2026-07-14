// Client-safe helpers for videos (no server-only imports).

export const VIDEO_CATEGORIES = [
  { slug: "politics", label: "राजनीति" },
  { slug: "india", label: "भारत" },
  { slug: "world", label: "विश्व" },
  { slug: "sports", label: "खेल" },
  { slug: "entertainment", label: "मनोरंजन" },
  { slug: "technology", label: "टेक्नोलॉजी" },
  { slug: "business", label: "बिज़नेस" },
  { slug: "health", label: "स्वास्थ्य" },
] as const;

export type VideoCategorySlug = (typeof VIDEO_CATEGORIES)[number]["slug"];

export const VIDEO_CATEGORY_LABELS: Record<VideoCategorySlug, string> =
  VIDEO_CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c.slug]: c.label }),
    {} as Record<VideoCategorySlug, string>,
  );

/** Extract a YouTube video ID from any common URL form. */
export function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const s = url.trim();
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
