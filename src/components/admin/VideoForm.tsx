import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, Youtube, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCreateVideo,
  adminUpdateVideo,
} from "@/lib/videos.functions";
import {
  VIDEO_CATEGORIES,
  parseYouTubeId,
  youtubeThumbnail,
} from "@/lib/videos";

type Initial = {
  id?: string;
  title?: string;
  description?: string | null;
  category?: string;
  source?: "youtube" | "upload";
  youtube_url?: string | null;
  youtube_id?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
};

export function VideoForm({ initial }: { initial?: Initial }) {
  const navigate = useNavigate();
  const createFn = useServerFn(adminCreateVideo);
  const updateFn = useServerFn(adminUpdateVideo);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "india");
  const [source, setSource] = useState<"youtube" | "upload">(
    initial?.source ?? "youtube",
  );
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const ytId = source === "youtube" ? parseYouTubeId(youtubeUrl) : null;

  // Auto-generate YouTube thumbnail when URL changes and thumbnail is empty/auto
  useEffect(() => {
    if (source === "youtube" && ytId) {
      const yt = youtubeThumbnail(ytId);
      // Only overwrite if empty or previously auto-generated
      setThumbnailUrl((prev) =>
        !prev || prev.startsWith("https://i.ytimg.com/") ? yt : prev,
      );
    }
  }, [ytId, source]);

  async function uploadFile(
    file: File,
    prefix: "videos" | "thumbs",
  ): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("video-uploads")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    // Bucket is private; generate a long-lived signed URL (1 year).
    const { data, error: signErr } = await supabase.storage
      .from("video-uploads")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !data) throw signErr ?? new Error("Failed to sign URL");
    return data.signedUrl;
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error("वीडियो 500MB से बड़ा नहीं होना चाहिए");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file, "videos");
      setVideoUrl(url);
      toast.success("वीडियो अपलोड हो गया");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "अपलोड विफल");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "thumbs");
      setThumbnailUrl(url);
      toast.success("Thumbnail अपलोड हो गई");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "अपलोड विफल");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("शीर्षक ज़रूरी है");
    if (source === "youtube" && !ytId)
      return toast.error("मान्य YouTube URL डालें");
    if (source === "upload" && !videoUrl)
      return toast.error("वीडियो फ़ाइल अपलोड करें");

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description?.trim() || null,
        category,
        source,
        youtube_url: source === "youtube" ? youtubeUrl.trim() : null,
        youtube_id: source === "youtube" ? ytId : null,
        video_url: source === "upload" ? videoUrl : null,
        thumbnail_url: thumbnailUrl || null,
        duration: duration?.trim() || null,
        is_featured: isFeatured,
        is_published: isPublished,
      };
      if (initial?.id) {
        await updateFn({ data: { id: initial.id, ...payload } });
        toast.success("वीडियो अपडेट हो गया");
      } else {
        await createFn({ data: payload });
        toast.success("वीडियो जोड़ा गया");
      }
      navigate({ to: "/admin/videos" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "सेव विफल");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Source toggle */}
      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setSource("youtube")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${
            source === "youtube" ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <Youtube className="h-4 w-4" /> YouTube
        </button>
        <button
          type="button"
          onClick={() => setSource("upload")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${
            source === "upload" ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      {source === "youtube" ? (
        <Field label="YouTube URL">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputCls}
          />
          {ytId && (
            <p className="mt-1 text-xs text-green-600">
              ✓ Video ID: <code>{ytId}</code>
            </p>
          )}
        </Field>
      ) : (
        <Field label="वीडियो फ़ाइल (MP4 / WebM / MOV, अधिकतम 500MB)">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoUpload}
              className="block text-sm"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {videoUrl && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              ✓ Uploaded
            </p>
          )}
        </Field>
      )}

      <Field label="शीर्षक">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          required
        />
      </Field>

      <Field label="विवरण">
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="श्रेणी">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="अवधि (जैसे 2:35)">
          <input
            value={duration ?? ""}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="mm:ss"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Thumbnail URL (या अपलोड करें)">
        <input
          value={thumbnailUrl ?? ""}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
        <div className="mt-2 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbUpload}
            className="block text-sm"
          />
        </div>
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="thumb"
            className="mt-3 h-32 rounded-md object-cover border border-border"
          />
        )}
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial?.id ? "अपडेट करें" : "जोड़ें"}
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/videos" })}
          className="rounded-md border border-border px-5 py-2 text-sm font-semibold hover:bg-accent"
        >
          रद्द करें
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}
