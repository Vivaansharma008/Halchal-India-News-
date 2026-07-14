import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListAds,
  adminDeleteAd,
  adminToggleAd,
} from "@/lib/ads.functions";
import { checkIsAdmin } from "@/lib/news.functions";
import { AD_POSITION_LABELS } from "@/lib/ad-positions";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/ads/")({
  head: () => ({
    meta: [
      { title: "विज्ञापन प्रबंधन — Halchal India " },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdsDashboard,
});

function AdsDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFn = useServerFn(adminListAds);
  const delFn = useServerFn(adminDeleteAd);
  const toggleFn = useServerFn(adminToggleAd);
  const checkFn = useServerFn(checkIsAdmin);

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["check-admin"],
    queryFn: () => checkFn(),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "ads"],
    queryFn: () => listFn(),
    enabled: !!roleData?.isAdmin,
  });

  async function handleLogout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete ad "${title}"?`)) return;
    try {
      await delFn({ data: { id } });
      toast.success("Ad deleted");
      queryClient.invalidateQueries({ queryKey: ["ads", "active"] });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleToggle(id: string, is_enabled: boolean) {
    try {
      await toggleFn({ data: { id, is_enabled } });
      queryClient.invalidateQueries({ queryKey: ["ads", "active"] });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  if (roleLoading) return <div className="container-news py-12">Loading…</div>;
  if (!roleData?.isAdmin) {
    return (
      <div className="container-news py-16 text-center">
        <h1 className="text-2xl font-bold">अनधिकृत पहुँच</h1>
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    );
  }

  return (
    <div className="container-news py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Advertisement Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage banners, sidebar ads & in-article ads
          </p>
        </div>
        <Link
          to="/admin/ads/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New Ad
        </Link>
      </div>

      {isLoading ? (
        <p className="py-12 text-center">Loading…</p>
      ) : !data || data.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No ads yet. Click <strong>New Ad</strong> to create one.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((ad) => (
            <div
              key={ad.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <img
                src={ad.image_url}
                alt={ad.title}
                className="h-36 w-full object-cover"
              />
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{ad.title}</h3>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      ad.is_enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ad.is_enabled ? "Live" : "Off"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {AD_POSITION_LABELS[ad.position]}
                </div>
                <a
                  href={ad.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-primary hover:underline"
                >
                  {ad.link_url}
                </a>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={ad.is_enabled}
                      onChange={(e) => handleToggle(ad.id, e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    Enabled
                  </label>
                  <div className="flex gap-1">
                    <Link
                      to="/admin/ads/edit/$id"
                      params={{ id: ad.id }}
                      className="grid h-8 w-8 place-items-center rounded hover:bg-accent"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(ad.id, ad.title)}
                      className="grid h-8 w-8 place-items-center rounded text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
