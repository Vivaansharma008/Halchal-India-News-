import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminImportBloggerBatch, type ImportResultItem } from "@/lib/blogger-import.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, Play, Pause, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/import")({
  head: () => ({
    meta: [
      { title: "Blogger Import — Halchal India" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BloggerImportPage,
});

type ParsedPost = {
  source_id: string;
  source_url: string | null;
  title: string;
  summary: string;
  content: string;
  category: "politics" | "sports" | "entertainment" | "technology" | "uttar-pradesh";
  image_url: string | null;
  author_name: string | null;
  published_at: string;
  slug: string;
};

const CATEGORY_HINTS: Array<{ match: RegExp; cat: ParsedPost["category"] }> = [
  { match: /राजनीति|politics|चुनाव/i, cat: "politics" },
  { match: /खेल|sport|क्रिकेट|फुटबॉल/i, cat: "sports" },
  { match: /मनोरंजन|entertainment|बॉलीवुड|फिल्म/i, cat: "entertainment" },
  { match: /टेक्नोलॉजी|तकनीक|technology|मोबाइल|gadget/i, cat: "technology" },
];

function mapCategory(labels: string[], title: string, content: string): ParsedPost["category"] {
  const hay = (labels.join(" ") + " " + title + " " + content.slice(0, 500)).toLowerCase();
  for (const h of CATEGORY_HINTS) if (h.match.test(hay)) return h.cat;
  return "uttar-pradesh";
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function makeSlug(title: string, sourceId: string): string {
  const idSuffix = sourceId.replace(/[^a-zA-Z0-9]/g, "").slice(-10);
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const asciiOnly = base.replace(/[^a-z0-9-]/g, "");
  const slugBase = asciiOnly.length >= 3 ? asciiOnly : `post`;
  return `${slugBase}-${idSuffix}`;
}

function firstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function parseFeed(xmlText: string): ParsedPost[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const entries = Array.from(doc.getElementsByTagName("entry"));
  const posts: ParsedPost[] = [];
  for (const entry of entries) {
    // Only POST type entries (skip PAGE/COMMENT/TEMPLATE/SETTINGS)
    const typeEl = entry.getElementsByTagName("blogger:type")[0];
    const type = typeEl?.textContent?.trim();
    if (type && type !== "POST") continue;

    const statusEl = entry.getElementsByTagName("blogger:status")[0];
    const status = statusEl?.textContent?.trim();
    if (status && status !== "LIVE") continue;

    const idEl = entry.getElementsByTagName("id")[0];
    const sourceId = idEl?.textContent?.trim() || "";
    if (!sourceId) continue;

    const titleEl = entry.getElementsByTagName("title")[0];
    const title = (titleEl?.textContent || "").trim();
    if (!title) continue;

    const contentEl = entry.getElementsByTagName("content")[0];
    const content = contentEl?.textContent || "";
    if (!content || content.length < 20) continue;

    const publishedEl = entry.getElementsByTagName("published")[0];
    const published_at = publishedEl?.textContent?.trim() || new Date().toISOString();

    const authorEl = entry.getElementsByTagName("author")[0];
    const author_name = authorEl?.getElementsByTagName("name")[0]?.textContent?.trim() || null;

    // Links: pick alternate
    let source_url: string | null = null;
    const links = entry.getElementsByTagName("link");
    for (const l of Array.from(links)) {
      if (l.getAttribute("rel") === "alternate") {
        source_url = l.getAttribute("href");
        break;
      }
    }

    // Categories: scheme="http://www.blogger.com/atom/ns#" denotes labels
    const cats = entry.getElementsByTagName("category");
    const labels: string[] = [];
    for (const c of Array.from(cats)) {
      const term = c.getAttribute("term");
      const scheme = c.getAttribute("scheme") || "";
      if (term && scheme.includes("blogger.com")) labels.push(term);
    }

    const plain = stripHtml(content);
    const summary = plain.slice(0, 300);
    const category = mapCategory(labels, title, plain);
    const image_url = firstImage(content);
    const slug = makeSlug(title, sourceId);

    posts.push({
      source_id: sourceId,
      source_url,
      title,
      summary,
      content,
      category,
      image_url,
      author_name,
      published_at,
      slug,
    });
  }
  return posts;
}

const BATCH_SIZE = 25;
const STORAGE_KEY = "blogger_import_state_v1";

type SavedState = {
  fileName: string;
  total: number;
  nextIndex: number;
  imported: number;
  skipped: number;
  failed: number;
  failures: Array<{ source_id: string; reason: string; title?: string }>;
};

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}
function saveState(s: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function BloggerImportPage() {
  const importFn = useServerFn(adminImportBloggerBatch);
  const [fileName, setFileName] = useState<string>("");
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [parsing, setParsing] = useState(false);
  const [running, setRunning] = useState(false);
  const [nextIndex, setNextIndex] = useState(0);
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [failed, setFailed] = useState(0);
  const [failures, setFailures] = useState<SavedState["failures"]>([]);
  const [log, setLog] = useState<string[]>([]);
  const pauseRef = useRef(false);

  const total = posts.length;
  const progress = total > 0 ? Math.round(((nextIndex) / total) * 100) : 0;

  // Restore counters from saved state when posts re-parsed and filename matches
  function applySavedIfAny(name: string) {
    const s = loadState();
    if (s && s.fileName === name) {
      setNextIndex(s.nextIndex);
      setImported(s.imported);
      setSkipped(s.skipped);
      setFailed(s.failed);
      setFailures(s.failures);
      setLog((l) => [
        ...l,
        `Restored saved progress: ${s.nextIndex}/${s.total} done.`,
      ]);
    } else {
      setNextIndex(0);
      setImported(0);
      setSkipped(0);
      setFailed(0);
      setFailures([]);
    }
  }

  async function handleFile(file: File) {
    setParsing(true);
    setLog([`Reading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`]);
    try {
      const text = await file.text();
      setLog((l) => [...l, "Parsing XML..."]);
      const parsed = parseFeed(text);
      setPosts(parsed);
      setFileName(file.name);
      applySavedIfAny(file.name);
      setLog((l) => [...l, `Found ${parsed.length} posts.`]);
      toast.success(`Parsed ${parsed.length} posts`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setParsing(false);
    }
  }

  async function runImport(fromIndex: number) {
    if (total === 0) return;
    setRunning(true);
    pauseRef.current = false;
    let i = fromIndex;
    let imp = imported,
      skp = skipped,
      fld = failed;
    const fails = [...failures];

    while (i < total) {
      if (pauseRef.current) {
        setLog((l) => [...l, `Paused at ${i}/${total}.`]);
        break;
      }
      const batch = posts.slice(i, i + BATCH_SIZE);
      try {
        const { results } = await importFn({ data: { posts: batch } });
        for (const r of results) {
          if (r.status === "imported") imp++;
          else if (r.status === "skipped") skp++;
          else {
            fld++;
            const src = batch.find((b) => b.source_id === r.source_id);
            fails.push({
              source_id: r.source_id,
              reason: r.reason || "unknown",
              title: src?.title,
            });
          }
        }
      } catch (e) {
        // whole batch failed
        fld += batch.length;
        for (const b of batch)
          fails.push({
            source_id: b.source_id,
            reason: e instanceof Error ? e.message : "batch failed",
            title: b.title,
          });
      }
      i += batch.length;
      setNextIndex(i);
      setImported(imp);
      setSkipped(skp);
      setFailed(fld);
      setFailures(fails);
      saveState({
        fileName,
        total,
        nextIndex: i,
        imported: imp,
        skipped: skp,
        failed: fld,
        failures: fails,
      });
    }
    setRunning(false);
    if (i >= total) {
      setLog((l) => [...l, `Done. Imported ${imp}, skipped ${skp}, failed ${fld}.`]);
      toast.success("Import complete");
    }
  }

  function downloadReport() {
    const report = {
      file: fileName,
      total,
      imported,
      skipped,
      failed,
      processed: nextIndex,
      generated_at: new Date().toISOString(),
      failures,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blogger-import-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-news py-8 max-w-5xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Blogger Import</h1>
      <p className="text-sm text-muted-foreground">
        Upload Blogger feed.atom XML to import posts in batches. Duplicates are auto-skipped.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Blogger feed.atom file</span>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xml,.atom,application/xml,text/xml"
              disabled={parsing || running}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground file:cursor-pointer"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          {fileName && (
            <span className="text-xs text-muted-foreground">
              Loaded: {fileName} • {total} posts
            </span>
          )}
        </label>
      </div>

      {total > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Total" value={total} />
          <Stat label="Imported" value={imported} className="text-green-700" />
          <Stat label="Skipped" value={skipped} className="text-amber-700" />
          <Stat label="Failed" value={failed} className="text-destructive" />
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>
              Progress: {nextIndex} / {total}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
          <div className="mt-4 flex flex-wrap gap-2">
            {!running ? (
              <>
                <Button onClick={() => runImport(nextIndex)} disabled={nextIndex >= total}>
                  <Play className="h-4 w-4" />
                  {nextIndex === 0 ? "Start Import" : "Resume Import"}
                </Button>
                {nextIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Reset saved progress for this file?")) {
                        clearState();
                        setNextIndex(0);
                        setImported(0);
                        setSkipped(0);
                        setFailed(0);
                        setFailures([]);
                        setLog((l) => [...l, "Progress reset."]);
                      }
                    }}
                  >
                    Reset
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="destructive"
                onClick={() => {
                  pauseRef.current = true;
                }}
              >
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            {(imported > 0 || failed > 0) && (
              <Button variant="outline" onClick={downloadReport}>
                <FileDown className="h-4 w-4" /> Download Report
              </Button>
            )}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-xs font-mono max-h-48 overflow-auto">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}

      {failures.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">
            Failed Posts ({failures.length})
          </h2>
          <div className="max-h-64 overflow-auto text-xs">
            {failures.slice(0, 100).map((f, i) => (
              <div key={i} className="border-b border-border py-1">
                <div className="truncate">{f.title || f.source_id}</div>
                <div className="text-destructive">{f.reason}</div>
              </div>
            ))}
            {failures.length > 100 && (
              <div className="pt-2 text-muted-foreground">
                + {failures.length - 100} more (download report for full list)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${className}`}>{value.toLocaleString()}</div>
    </div>
  );
}
