import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  adminDeleteNews,
  checkIsAdmin,
  adminBackfillSlugs,
} from "@/lib/news.functions";
import { adminListNewsWithViews, adminViewAnalytics } from "@/lib/views.functions";
import { CATEGORY_LABELS, type CategorySlug } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Pencil, Trash2, LogOut, ExternalLink, Megaphone, Upload, Wand2,
  Eye, ArrowUpDown, TrendingUp, Calendar, CalendarDays, PlayCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "एडमिन डैशबोर्ड — Halchal India " },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListNewsWithViews);
  const delFn = useServerFn(adminDeleteNews);
  const checkFn = useServerFn(checkIsAdmin);
  const backfillFn = useServerFn(adminBackfillSlugs);
  const analyticsFn = useServerFn(adminViewAnalytics);
  const [backfilling, setBackfilling] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "views">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["check-admin"],
    queryFn: () => checkFn(),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "news"],
    queryFn: () => listFn(),
    enabled: !!roleData?.isAdmin,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin", "view-analytics"],
    queryFn: () => analyticsFn(),
    enabled: !!roleData?.isAdmin,
  });

  const sortedData = useMemo(() => {
    if (!data) return data;
    const rows = [...data];
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "views") cmp = (a.view_count ?? 0) - (b.view_count ?? 0);
      else cmp = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, sortBy, sortDir]);

  function toggleSort(col: "date" | "views") {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  }


  async function handleLogout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`क्या आप "${title}" को हटाना चाहते हैं?`)) return;
    try {
      await delFn({ data: { id } });
      toast.success("समाचार हटा दिया गया");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "त्रुटि");
    }
  }

  async function handleBackfillSlugs() {
    if (backfilling) return;
    if (!confirm("Convert all remaining Hindi/garbage URLs to SEO-friendly English slugs? Old URLs will 301-redirect to new ones. Runs in batches of 25.")) return;
    setBackfilling(true);
    let totalUpdated = 0;
    try {
      // Loop until no candidates left
      for (let i = 0; i < 200; i++) {
        const r = await backfillFn({ data: { limit: 25 } });
        totalUpdated += r.updated;
        toast.message(`Batch ${i + 1}: updated ${r.updated}, total ${totalUpdated}. Candidates left: ${r.candidates_left}`);
        if (r.processed === 0) break;
        // small pause to avoid rate limits
        await new Promise((res) => setTimeout(res, 600));
      }
      toast.success(`Slug backfill done. Updated ${totalUpdated} articles.`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setBackfilling(false);
    }
  }

  if (roleLoading) return <div className="container-news py-12">लोड हो रहा है...</div>;

  if (!roleData?.isAdmin) {
    return (
      <div className="container-news py-16 text-center">
        <h1 className="text-2xl font-bold">अनधिकृत पहुँच</h1>
        <p className="mt-2 text-muted-foreground">
          आपके खाते के पास एडमिन अधिकार नहीं हैं।
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> लॉगआउट
        </button>
      </div>
    );
  }

  return (
    <div className="container-news py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">एडमिन डैशबोर्ड</h1>
          <p className="text-sm text-muted-foreground">समाचार प्रबंधन</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> नया समाचार
          </Link>
          <Link
            to="/admin/ads"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <Megaphone className="h-4 w-4" /> Manage Ads
          </Link>
          <Link
            to="/admin/videos"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <PlayCircle className="h-4 w-4" /> Manage Videos
          </Link>
          <Link
            to="/admin/import"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <Upload className="h-4 w-4" /> Blogger Import
          </Link>
          <button
            onClick={handleBackfillSlugs}
            disabled={backfilling}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-60"
            title="Convert old Hindi URLs to English SEO slugs"
          >
            <Wand2 className="h-4 w-4" /> {backfilling ? "Fixing slugs..." : "Fix URL Slugs"}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> लॉगआउट
          </button>
        </div>
      </div>

      {analytics && (
        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard icon={<Eye className="h-4 w-4" />} label="कुल व्यूज़" value={analytics.total} />
          <AnalyticsCard icon={<Calendar className="h-4 w-4" />} label="आज के व्यूज़" value={analytics.today} />
          <AnalyticsCard icon={<CalendarDays className="h-4 w-4" />} label="इस सप्ताह" value={analytics.week} />
          <AnalyticsCard icon={<TrendingUp className="h-4 w-4" />} label="कुल लेख" value={data?.length ?? 0} />
        </div>
      )}

      {analytics && analytics.top.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Top 10 सर्वाधिक देखे गए लेख
          </h2>
          <ol className="space-y-1.5 text-sm">
            {analytics.top.map((t, i) => (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <Link
                    to="/news/$slug"
                    params={{ slug: t.slug }}
                    target="_blank"
                    className="truncate hover:text-primary"
                  >
                    {t.title}
                  </Link>
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Eye className="h-3 w-3" /> {t.view_count.toLocaleString("hi-IN")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center">लोड हो रहा है...</p>
      ) : !sortedData || sortedData.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          अभी कोई समाचार नहीं है। पहला समाचार जोड़ें।
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">शीर्षक</th>
                <th className="px-4 py-3 font-semibold">श्रेणी</th>
                <th className="px-4 py-3 font-semibold">स्थिति</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    onClick={() => toggleSort("views")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                    title="Sort by views"
                  >
                    <Eye className="h-3.5 w-3.5" /> व्यूज़
                    <ArrowUpDown className={`h-3 w-3 ${sortBy === "views" ? "text-primary" : "opacity-50"}`} />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1 hover:text-primary"
                    title="Sort by date"
                  >
                    तारीख
                    <ArrowUpDown className={`h-3 w-3 ${sortBy === "date" ? "text-primary" : "opacity-50"}`} />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-right">क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((n) => (
                <tr key={n.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium max-w-md">
                    <div className="truncate">{n.title}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CATEGORY_LABELS[n.category as CategorySlug] ?? n.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.is_breaking && (
                        <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                          ब्रेकिंग
                        </span>
                      )}
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          n.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {n.is_published ? "प्रकाशित" : "ड्राफ्ट"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {(n.view_count ?? 0).toLocaleString("hi-IN")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(n.published_at).toLocaleDateString("hi-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to="/news/$slug"
                        params={{ slug: n.slug }}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded hover:bg-accent"
                        title="देखें"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/admin/edit/$id"
                        params={{ id: n.id }}
                        className="grid h-8 w-8 place-items-center rounded hover:bg-accent"
                        title="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
                        className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-destructive/10"
                        title="हटाएँ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString("hi-IN")}</div>
    </div>
  );
}

