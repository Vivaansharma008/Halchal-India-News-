import { useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

export function SubscribeButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("कृपया वैध ईमेल दर्ज करें");
      return;
    }
    setSubmitting(true);
    try {
      // Phase 1: store locally; Phase 2 will POST to subscribers table
      const key = "halchal:subscribers";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (!existing.includes(email)) existing.push(email);
      localStorage.setItem(key, JSON.stringify(existing));
      toast.success("धन्यवाद! आप सब्सक्राइब हो गए।");
      setEmail("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold ring-1 ring-white/30 hover:bg-white/25 transition"
            : "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        }
      >
        <Bell className="h-3.5 w-3.5" />
        सब्सक्राइब
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="बंद करें"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-6 w-6" />
              </div>
              <h2 className="mt-3 text-xl font-bold">रोज़ाना ताज़ा खबरें पाएँ</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ईमेल से ब्रेकिंग न्यूज़ और मुख्य अपडेट सीधे पाएँ।
              </p>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="आपका ईमेल पता"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "..." : "मुफ़्त सब्सक्राइब करें"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                कभी भी अनसब्सक्राइब करें — कोई स्पैम नहीं।
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
