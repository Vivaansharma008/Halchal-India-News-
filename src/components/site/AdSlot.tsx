import { useQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { listActiveAds, type Ad, type AdPosition } from "@/lib/ads.functions";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const adsQueryOptions = queryOptions({
  queryKey: ["ads", "active"],
  queryFn: () => listActiveAds(),
  staleTime: 5 * 60 * 1000,
});

const ADSENSE_CLIENT =
  (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined) ?? "";

// Map our internal positions to Google AdSense ad slot IDs via env vars.
// Set e.g. VITE_ADSENSE_SLOT_HEADER=1234567890 in .env to enable that slot.
function adsenseSlotFor(position: AdPosition): string | null {
  const key = `VITE_ADSENSE_SLOT_${position.toUpperCase()}`;
  const slot = (import.meta.env as Record<string, string | undefined>)[key];
  return slot && slot.length > 0 ? slot : null;
}

function pickAd(ads: Ad[] | undefined, position: AdPosition, index = 0) {
  if (!ads) return null;
  const pool = ads.filter((a) => a.position === position);
  if (pool.length === 0) return null;
  return pool[index % pool.length];
}

type Variant = "banner" | "sidebar" | "in-article";

const variantClasses: Record<Variant, string> = {
  banner: "w-full max-h-[180px] sm:max-h-[200px] object-cover",
  sidebar: "w-full aspect-[4/3] object-cover",
  "in-article": "w-full max-h-[220px] object-cover",
};

function AdsenseUnit({
  slot,
  variant,
}: {
  slot: string;
  variant: Variant;
}) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* AdSense not loaded yet */
    }
  }, []);
  const minH =
    variant === "sidebar" ? 250 : variant === "in-article" ? 200 : 90;
  return (
    <ins
      ref={ref}
      className="adsbygoogle block"
      style={{ display: "block", minHeight: minH }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export function AdSlot({
  position,
  index = 0,
  variant = "banner",
  label = "Advertisement",
}: {
  position: AdPosition;
  index?: number;
  variant?: Variant;
  label?: "Advertisement" | "Sponsored";
}) {
  const { data } = useQuery(adsQueryOptions);
  const ad = pickAd(data, position, index);
  const adsenseSlot = ADSENSE_CLIENT ? adsenseSlotFor(position) : null;

  if (!ad && !adsenseSlot) return null;

  return (
    <aside
      aria-label={label}
      data-ad-position={position}
      className="my-5 not-prose"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-1.5">
        {label}
      </div>
      {adsenseSlot ? (
        <AdsenseUnit slot={adsenseSlot} variant={variant} />
      ) : ad ? (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition"
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            loading="lazy"
            className={variantClasses[variant]}
          />
          {ad.title && (
            <div className="px-3 py-2 text-sm font-medium text-foreground/90 border-t border-border bg-secondary/40">
              {ad.title}
            </div>
          )}
        </a>
      ) : null}
    </aside>
  );
}

/**
 * Renders article body, inserting an ad after every N paragraphs.
 * Supports both plain text (legacy) and HTML (rich editor) content.
 */
export function ArticleBodyWithAds({
  content,
  every = 3,
}: {
  content: string;
  every?: number;
}) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const nodes: React.ReactNode[] = [];
  let adIndex = 0;

  if (isHtml) {
    const parts = content
      .split(/(?<=<\/(?:p|h[1-6]|ul|ol|blockquote|figure)>|<hr\s*\/?>)/i)
      .map((p) => p.trim())
      .filter(Boolean);
    parts.forEach((chunk, i) => {
      nodes.push(
        <div
          key={`b-${i}`}
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(chunk) }}
        />,
      );
      const isLast = i === parts.length - 1;
      if (!isLast && (i + 1) % every === 0) {
        nodes.push(
          <AdSlot
            key={`ad-${i}`}
            position="in_article"
            index={adIndex++}
            variant="in-article"
            label="Advertisement"
          />,
        );
      }
    });
  } else {
    const paragraphs = content
      .split(/\n{2,}|\r\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const blocks =
      paragraphs.length > 1
        ? paragraphs
        : content.split(/\n/).map((p) => p.trim()).filter(Boolean);
    blocks.forEach((p, i) => {
      nodes.push(
        <p
          key={`p-${i}`}
          className="mt-4 text-base leading-8 text-foreground/90 whitespace-pre-wrap"
        >
          {p}
        </p>,
      );
      const isLast = i === blocks.length - 1;
      if (!isLast && (i + 1) % every === 0) {
        nodes.push(
          <AdSlot
            key={`ad-${i}`}
            position="in_article"
            index={adIndex++}
            variant="in-article"
            label="Advertisement"
          />,
        );
      }
    });
  }

  return <div className="mt-2">{nodes}</div>;
}
