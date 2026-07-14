import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { ArrowLeft, Upload, Eye, Save } from "lucide-react";
import {
  adminCreateNews,
  adminUpdateNews,
  type NewsDetail,
} from "@/lib/news.functions";
import { RichEditor } from "./RichEditor";

export type NewsFormValues = {
  title: string;
  summary: string;
  content: string;
  category: CategorySlug;
  image_url: string | null;
  is_breaking: boolean;
  is_published: boolean;
};

export function NewsForm({
  initial,
  newsId,
}: {
  initial?: Partial<NewsDetail & NewsFormValues>;
  newsId?: string;
}) {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateNews);
  const updateFn = useServerFn(adminUpdateNews);
  const draftKey = `halchal:draft:${newsId ?? "new"}`;

  const [values, setValues] = useState<NewsFormValues>(() => {
    if (typeof window !== "undefined" && !initial) {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        try { return JSON.parse(raw); } catch { /* ignore */ }
      }
    }
    return {
      title: initial?.title ?? "",
      summary: initial?.summary ?? "",
      content: initial?.content ?? "",
      category: (initial?.category as CategorySlug) ?? "politics",
      image_url: initial?.image_url ?? null,
      is_breaking: initial?.is_breaking ?? false,
      is_published: initial?.is_published ?? true,
    };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showPreview, setShowPreview] = useState(false);

  // Autosave to localStorage every 2s after a change
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    setDraftStatus("saving");
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values));
        setDraftStatus("saved");
      } catch { /* quota */ }
    }, 1500);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [values, draftKey]);

  function update<K extends keyof NewsFormValues>(k: K, v: NewsFormValues[K]) {
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
      const path = `cover/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("news-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("news-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      update("image_url", signed.signedUrl);
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (newsId) {
        await updateFn({ data: { id: newsId, ...values } });
        toast.success("News updated");
      } else {
        await createFn({ data: values });
        toast.success("News published");
      }
      try { window.localStorage.removeItem(draftKey); } catch { /* */ }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-news py-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="h-3.5 w-3.5" />
          {draftStatus === "saving" ? "Saving draft..." : draftStatus === "saved" ? "Draft auto-saved" : "Draft"}
        </div>
      </div>
      <h1 className="mt-3 text-2xl font-bold">
        {newsId ? "Edit News" : "Add New News"}
      </h1>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 min-w-0">
          <Field label="Title" required>
            <input
              required
              maxLength={300}
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              className="input text-lg font-semibold"
              placeholder="समाचार का शीर्षक..."
            />
            {!newsId && values.title.trim().length > 2 && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                SEO-friendly English URL slug will be auto-generated from this title on save.
              </div>
            )}
          </Field>

          <Field label="Summary / Meta Description" required>
            <textarea
              required
              maxLength={500}
              rows={2}
              value={values.summary}
              onChange={(e) => update("summary", e.target.value)}
              className="input"
              placeholder="1-2 lines summary (SEO meta description)..."
            />
            <div className="mt-1 text-[11px] text-muted-foreground text-right">{values.summary.length}/500</div>
          </Field>

          <Field label="Article Content" required>
            <RichEditor
              value={values.content}
              onChange={(html) => update("content", html)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tip: cursor par image insert होती है. Drag &amp; drop ya paste से भी image जोड़ें.
            </p>
          </Field>

          {showPreview && (
            <div className="rounded-md border border-border bg-card p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Live Preview</div>
              <h2 className="text-2xl font-bold">{values.title || "Untitled"}</h2>
              <p className="mt-2 text-muted-foreground">{values.summary}</p>
              <div className="prose-article mt-4" dangerouslySetInnerHTML={{ __html: values.content }} />
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-md border border-border bg-card p-4 space-y-4">
            <Field label="Category" required>
              <select
                value={values.category}
                onChange={(e) => update("category", e.target.value as CategorySlug)}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Cover Image (max 5MB)">
              <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary px-3 py-2 text-sm cursor-pointer hover:border-primary">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Choose Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {values.image_url && (
                <img src={values.image_url} alt="cover" className="mt-2 h-32 w-full rounded-md object-cover" />
              )}
            </Field>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={values.is_breaking} onChange={(e) => update("is_breaking", e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm font-semibold">Breaking News</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={values.is_published} onChange={(e) => update("is_published", e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm font-semibold">Publish (uncheck = Save as Draft)</span>
              </label>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4 space-y-2">
            <button type="submit" disabled={saving || uploading} className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving..." : newsId ? "Update" : values.is_published ? "Publish" : "Save Draft"}
            </button>
            <button type="button" onClick={() => setShowPreview((s) => !s)} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
              <Eye className="h-4 w-4" /> {showPreview ? "Hide Preview" : "Live Preview"}
            </button>
            <Link to="/admin" className="block text-center w-full rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
              Cancel
            </Link>
          </div>
        </aside>
      </form>

      <style>{`.input{width:100%;border:1px solid var(--input);background:var(--background);padding:.55rem .75rem;border-radius:.375rem;outline:none;font:inherit}.input:focus{border-color:var(--primary)}`}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

