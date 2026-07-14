import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search, Menu, X, Facebook, Twitter, Youtube, Instagram,
  Bell, Sun, Moon, Zap, Newspaper, User, Phone, Info, Shield, ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/lib/categories";
import { listBreakingNews } from "@/lib/news.functions";
import halchalLogo from "@/assets/halchal-logo.png.asset.json";

// Primary categories inline in nav; the rest live in the full-screen menu.
const PRIMARY_SLUGS = ["uttar-pradesh", "crime", "politics", "entertainment"] as const;
const PRIMARY = CATEGORIES.filter((c) => (PRIMARY_SLUGS as readonly string[]).includes(c.slug));

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem("theme");
    const initial = saved === "dark";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

export function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [q, setQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { dark, toggle } = useDarkMode();

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const { data: breaking = [] } = useQuery({
    queryKey: ["news", "breaking"],
    queryFn: () => listBreakingNews(),
    staleTime: 60_000,
  });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    setMobileSearch(false);
    navigate({ to: "/search", search: { q: term } });
  }

  const tickerItems = breaking.length ? breaking : [];
  const tickerLoop = [...tickerItems, ...tickerItems];
  const unread = 3;

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong shadow-[0_1px_0_0_color-mix(in_oklab,var(--color-foreground)_8%,transparent)]">
        {/* ===== TOP RED STRIP: breaking ticker + socials ===== */}
        <div className="bg-[#C80000] text-white text-[12px]">
          <div className="container-news flex h-9 items-center gap-3">
            {/* White breaking chip */}
            <div className="flex items-center gap-1.5 shrink-0 rounded-sm bg-white text-[#C80000] px-2 py-0.5 font-extrabold uppercase tracking-wider text-[10px] shadow-sm">
              <Zap className="h-3 w-3 fill-[#C80000]" />
              ब्रेकिंग&nbsp;न्यूज़
            </div>

            {/* Ticker */}
            <div className="relative flex-1 overflow-hidden">
              {mounted && tickerLoop.length > 0 ? (
                <div className="animate-ticker flex gap-10 whitespace-nowrap font-medium">
                  {tickerLoop.map((n, i) => (
                    <Link
                      key={`${n.id}-${i}`}
                      to="/news/$slug"
                      params={{ slug: n.slug }}
                      className="hover:underline underline-offset-4"
                    >
                      {n.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="opacity-90">ताज़ा ख़बरों के लिए बने रहिए…</span>
              )}
            </div>

            {/* Socials (desktop) */}
            <div className="hidden md:flex items-center gap-1 shrink-0 pl-3">
              <a href="https://www.facebook.com/halchalindianews" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-6 w-6 place-items-center rounded hover:bg-white/15 transition"><Facebook className="h-3.5 w-3.5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="grid h-6 w-6 place-items-center rounded hover:bg-white/15 transition"><Twitter className="h-3.5 w-3.5" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-6 w-6 place-items-center rounded hover:bg-white/15 transition"><Youtube className="h-3.5 w-3.5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-6 w-6 place-items-center rounded hover:bg-white/15 transition"><Instagram className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>

        {/* ===== MAIN BAR: logo + inline nav + actions ===== */}
        <div className="border-b border-border/60">
          <div className="container-news grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6 h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0" aria-label="Halchal India News — Home">
              <img
                src={halchalLogo.url}
                alt="Halchal India News"
                width={330}
                height={180}
                className="h-12 md:h-16 w-auto object-contain select-none transition-transform duration-200 hover:scale-[1.02]"
                draggable={false}
              />
            </Link>

            {/* Inline nav (desktop) */}
            <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
              <InlineNav to="/" exact label="होम" />
              {PRIMARY.map((c) => (
                <InlineNav
                  key={c.slug}
                  to="/category/$category"
                  params={{ category: c.slug }}
                  label={c.label}
                />
              ))}
              <InlineNav to="/videos" label="वीडियो" />
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              {/* Desktop search */}
              <form
                onSubmit={submitSearch}
                className="hidden md:flex items-center gap-2 rounded-full bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#C80000] transition-all px-3 h-9"
              >
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="खोजें..."
                  aria-label="समाचार खोजें"
                  className="w-40 xl:w-56 bg-transparent outline-none text-sm placeholder:text-neutral-500"
                />
              </form>

              {/* Mobile search toggle */}
              <button
                type="button"
                aria-label="खोजें"
                onClick={() => setMobileSearch((v) => !v)}
                className="md:hidden grid h-10 w-10 place-items-center rounded-full text-neutral-800 hover:bg-neutral-100 transition"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  aria-label={`सूचनाएँ (${unread} नई)`}
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative grid h-10 w-10 place-items-center rounded-full text-neutral-800 hover:bg-neutral-100 transition"
                >
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#C80000] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-neutral-900 shadow-elevated ring-1 ring-neutral-200 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">नई सूचनाएँ</div>
                      {tickerItems.slice(0, 3).map((n) => (
                        <Link
                          key={n.id}
                          to="/news/$slug"
                          params={{ slug: n.slug }}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-2 rounded-lg p-2 hover:bg-neutral-100 transition"
                        >
                          <Newspaper className="h-4 w-4 text-[#C80000] shrink-0 mt-0.5" />
                          <span className="text-xs leading-snug line-clamp-2">{n.title}</span>
                        </Link>
                      ))}
                      {tickerItems.length === 0 && (
                        <div className="p-3 text-xs text-neutral-500">कोई नई सूचना नहीं</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Dark mode */}
              <button
                type="button"
                aria-label={dark ? "लाइट मोड" : "डार्क मोड"}
                onClick={toggle}
                className="grid h-10 w-10 place-items-center rounded-full text-neutral-800 hover:bg-neutral-100 transition"
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Hamburger */}
              <button
                type="button"
                aria-label={open ? "मेनू बंद करें" : "मेनू खोलें"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full text-neutral-800 hover:bg-neutral-100 transition"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile inline search */}
          {mobileSearch && (
            <div className="md:hidden container-news pb-3">
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-2 rounded-full bg-neutral-100 focus-within:ring-2 focus-within:ring-[#C80000] px-4 h-10"
              >
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="खोजें..."
                  aria-label="समाचार खोजें"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-500"
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ===== FULL-SCREEN SLIDE MENU ===== */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        {/* Panel — slides in from right */}
        <aside
          className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-elevated flex flex-col transform transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-label="मुख्य मेनू"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 h-16 bg-[#C80000] text-white shrink-0">
            <span className="font-extrabold uppercase tracking-wider text-sm">मेनू</span>
            <button
              type="button"
              aria-label="मेनू बंद करें"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-2 mb-2">
                श्रेणियाँ
              </div>
              <ul className="grid grid-cols-2 gap-1.5">
                <MenuItem to="/" exact label="🏠 होम" onClose={() => setOpen(false)} />
                {CATEGORIES.map((c) => (
                  <MenuItem
                    key={c.slug}
                    to="/category/$category"
                    params={{ category: c.slug }}
                    label={c.label}
                    onClose={() => setOpen(false)}
                  />
                ))}
                <MenuItem to="/videos" label="🎥 वीडियो" onClose={() => setOpen(false)} />
              </ul>
            </div>

            <div className="border-t border-neutral-200 px-4 py-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-2 mb-2">
                खाता व अन्य
              </div>
              <ul className="flex flex-col gap-0.5">
                <BottomLink to="/auth" icon={User} label="लॉगिन / प्रोफाइल" onClose={() => setOpen(false)} />
                <BottomLink to="/contact" icon={Phone} label="Contact Us" onClose={() => setOpen(false)} />
                <BottomLink to="/about" icon={Info} label="About Us" onClose={() => setOpen(false)} />
                <BottomLink to="/editorial-policy" icon={Info} label="Editorial Policy" onClose={() => setOpen(false)} />
                <BottomLink to="/corrections-policy" icon={Info} label="Corrections Policy" onClose={() => setOpen(false)} />
                <BottomLink to="/fact-checking-policy" icon={Shield} label="Fact-Checking Policy" onClose={() => setOpen(false)} />
                <BottomLink to="/privacy" icon={Shield} label="Privacy Policy" onClose={() => setOpen(false)} />
                <BottomLink to="/terms" icon={Info} label="Terms & Conditions" onClose={() => setOpen(false)} />
                <BottomLink to="/disclaimer" icon={Info} label="Disclaimer" onClose={() => setOpen(false)} />
              </ul>
            </div>
          </div>

          {/* Socials footer */}
          <div className="border-t border-neutral-200 px-5 py-4 flex items-center justify-center gap-3 shrink-0">
            <a href="https://www.facebook.com/halchalindianews" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-[#C80000] hover:text-white transition"><Facebook className="h-4 w-4" /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-[#C80000] hover:text-white transition"><Twitter className="h-4 w-4" /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-[#C80000] hover:text-white transition"><Youtube className="h-4 w-4" /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-[#C80000] hover:text-white transition"><Instagram className="h-4 w-4" /></a>
          </div>
        </aside>
      </div>
    </>
  );
}

function InlineNav({
  to, params, label, exact,
}: {
  to: string;
  params?: Record<string, string>;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      activeOptions={exact ? { exact: true } : undefined}
      className="relative px-3 py-2 rounded-md text-[15px] font-semibold text-neutral-800 hover:text-[#C80000] transition-colors group"
      activeProps={{ className: "text-[#C80000]" }}
    >
      {label}
      <span className="absolute left-3 right-3 -bottom-0.5 h-[3px] rounded bg-[#C80000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />
    </Link>
  );
}

function MenuItem({
  to, params, label, onClose, exact,
}: {
  to: string;
  params?: Record<string, string>;
  label: string;
  onClose: () => void;
  exact?: boolean;
}) {
  return (
    <li>
      <Link
        to={to as never}
        params={params as never}
        activeOptions={exact ? { exact: true } : undefined}
        onClick={onClose}
        className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-[#C80000]/5 hover:text-[#C80000] transition group"
        activeProps={{ className: "bg-[#C80000]/10 text-[#C80000]" }}
      >
        <span>{label}</span>
        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </Link>
    </li>
  );
}

function BottomLink({
  to, icon: Icon, label, onClose,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        to={to as never}
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition"
      >
        <Icon className="h-4 w-4 text-[#C80000]" />
        {label}
      </Link>
    </li>
  );
}
