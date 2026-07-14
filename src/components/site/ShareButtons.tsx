import { useState } from "react";
import { Facebook, Twitter, Link2, Check, Send } from "lucide-react";
import { toast } from "sonner";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : `https://halchalindianews.com${url}`;

  const enc = encodeURIComponent;
  const shareTitle = enc(title);
  const shareUrl = enc(fullUrl);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      icon: WhatsAppIcon,
      bg: "bg-[#25D366] hover:bg-[#1ebe57]",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: Facebook,
      bg: "bg-[#1877F2] hover:bg-[#136fdb]",
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
      icon: Twitter,
      bg: "bg-[#0f1419] hover:bg-black",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
      icon: Send,
      bg: "bg-[#0088cc] hover:bg-[#0077b3]",
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("लिंक कॉपी हो गया");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("कॉपी नहीं हो सका");
    }
  }

  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3">
      <span className="mr-2 text-sm font-semibold text-foreground/80">शेयर करें:</span>
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.label} पर शेयर करें`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition ${l.bg}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      <button
        onClick={copy}
        aria-label="लिंक कॉपी करें"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent transition"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
