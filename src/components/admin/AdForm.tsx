import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import {
  adminCreateAd,
  adminUpdateAd,
  type Ad,
  type AdPosition,
} from "@/lib/ads.functions";
import { AD_POSITIONS, AD_POSITION_LABELS } from "@/lib/ad-positions";

type FormValues = {
  title: string;
  image_url: string;
  link_url: string;
  position: AdPosition;
  is_enabled: boolean;
  sort_order: number;
};

export function AdForm({ initial, adId }: { initial?: Ad | null; adId?: string }) {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateAd);
  const updateFn = useServerFn(adminUpdateAd);

  const [values, setValues] = useState<FormValues>({
    title: initial?.title ?? "",
    image_url: initial?.image_url ?? "",
    link_url: initial?.link_url ?? "",
    position: (initial?.position as AdPosition) ?? "header",
    is_enabled: initial?.is_enabled ?? true,
    sort_order: initial?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `ads/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("news-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("news-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      update("image_url", signed.signedUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.image_url) {
      toast.error("Please upload an ad image");
      return;
    }
    setSaving(true);
    try {
      if (adId) {
        await updateFn({ data: { id: adId, ...values } });
        toast.success("Ad updated");
      } else {
        await createFn({ data: values });
        toast.success("Ad created");
      }
      navigate({ to: "/admin/ads" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-news py-8 max-w-3xl">
      <Link
        to="/admin/ads"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Ads
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{adId ? "Edit Ad" : "Add New Ad"}</h1>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <Field label="Ad Title" required>
          <input
            required
            maxLength={200}
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
            placeholder="e.g. Summer Sale — 50% off"
          />
        </Field>

        <Field label="Destination Link URL" required>
          <input
            required
            type="url"
            value={values.link_url}
            onChange={(e) => update("link_url", e.target.value)}
            className="input"
            placeholder="https://example.com/landing"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Position" required>
            <select
              value={values.position}
              onChange={(e) => update("position", e.target.value as AdPosition)}
              className="input"
            >
              {AD_POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {AD_POSITION_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sort Order">
            <input
              type="number"
              min={0}
              max={9999}
              value={values.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value) || 0)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Ad Image (up to 5MB)" required>
          <label className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary px-3 py-2 text-sm cursor-pointer hover:border-primary w-full">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Choose Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {values.image_url && (
            <img
              src={values.image_url}
              alt="preview"
              className="mt-3 max-h-48 w-full rounded-md object-cover border border-border"
            />
          )}
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values.is_enabled}
              onChange={(e) => update("is_enabled", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-semibold">Enabled (live on site)</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-md bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : adId ? "Update Ad" : "Create Ad"}
          </button>
          <Link
            to="/admin/ads"
            className="rounded-md border border-border px-6 py-2.5 font-semibold hover:bg-accent"
          >
            Cancel
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: For future Google AdSense integration, you can disable these custom
          ads per position and drop AdSense slot tags into the same components.
        </p>
      </form>

      <style>{`.input{width:100%;border:1px solid var(--input);background:var(--background);padding:.55rem .75rem;border-radius:.375rem;outline:none;font:inherit}.input:focus{border-color:var(--primary)}`}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
