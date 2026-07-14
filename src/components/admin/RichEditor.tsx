import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import FontFamily from "@tiptap/extension-font-family";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4, Pilcrow,
  List, ListOrdered, Quote, Minus, Undo, Redo, Eraser,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Image as ImageIcon, Smile,
} from "lucide-react";

const EMOJIS = ["😀","😂","😍","🥰","😎","🤩","😢","😡","👍","👎","🙏","👏","🔥","💯","🎉","❤️","⭐","✅","❌","⚠️","📢","📰","🚨","🏆","⚽","🏏","🎬","💻","🇮🇳"];

async function uploadImage(file: File): Promise<string> {
  let toUpload: File | Blob = file;
  try {
    if (file.size > 200 * 1024 && file.type.startsWith("image/")) {
      toUpload = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.85,
      });
    }
  } catch {
    /* fallback to original */
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `editor/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("news-images")
    .upload(path, toUpload, { contentType: file.type || "image/jpeg", upsert: false });
  if (upErr) throw upErr;
  const { data: signed, error: sErr } = await supabase.storage
    .from("news-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (sErr) throw sErr;
  return signed.signedUrl;
}

export function RichEditor({
  value,
  onChange,
  placeholder = "यहाँ समाचार लिखें...",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        validate: (href) => /^https?:\/\//i.test(href),
      }),
      Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: "editor-image" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none min-h-[420px] px-4 py-3",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imgItem = items.find((i) => i.type.startsWith("image/"));
        if (imgItem) {
          const file = imgItem.getAsFile();
          if (file) {
            event.preventDefault();
            insertImageFromFile(file, editorRef.current);
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length > 0) {
          event.preventDefault();
          const coords = { left: event.clientX, top: event.clientY };
          const pos = view.posAtCoords(coords)?.pos;
          files.forEach((f) => insertImageFromFile(f, editorRef.current, pos));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const editorRef = useRef<Editor | null>(null);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // Sync external value changes (e.g. loading existing article)
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return <div className="min-h-[420px] rounded-md border border-input bg-background" />;

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

async function insertImageFromFile(file: File, editor: Editor | null, pos?: number) {
  if (!editor) return;
  const tid = toast.loading("Image upload हो रही है...");
  try {
    const url = await uploadImage(file);
    const chain = editor.chain().focus();
    if (typeof pos === "number") chain.setTextSelection(pos);
    chain.setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    toast.success("Image जुड़ गई", { id: tid });
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Upload fail", { id: tid });
  }
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDetailsElement>(null);

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (http/https only)", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Only http/https links are allowed");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const f of files) await insertImageFromFile(f, editor);
  };

  const setImageAlign = (align: "left" | "center" | "right") => {
    if (!editor.isActive("image")) return;
    editor.chain().focus().updateAttributes("image", {
      style: align === "center"
        ? "display:block;margin-left:auto;margin-right:auto;"
        : `float:${align};margin:${align === "left" ? "0 1rem 1rem 0" : "0 0 1rem 1rem"};max-width:50%;`,
    }).run();
  };

  const editImageAlt = () => {
    if (!editor.isActive("image")) return;
    const cur = (editor.getAttributes("image").alt as string) ?? "";
    const alt = window.prompt("Alt text (SEO)", cur);
    if (alt === null) return;
    editor.chain().focus().updateAttributes("image", { alt }).run();
  };

  const imgActive = editor.isActive("image");

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/50 p-1.5 sticky top-0 z-10">
      <Group>
        <select
          aria-label="Paragraph style"
          className="tb-select"
          value={
            editor.isActive("heading", { level: 1 }) ? "h1" :
            editor.isActive("heading", { level: 2 }) ? "h2" :
            editor.isActive("heading", { level: 3 }) ? "h3" :
            editor.isActive("heading", { level: 4 }) ? "h4" :
            editor.isActive("heading", { level: 5 }) ? "h5" :
            editor.isActive("heading", { level: 6 }) ? "h6" : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1|2|3|4|5|6 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
        <select
          aria-label="Font family"
          className="tb-select"
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          defaultValue=""
        >
          <option value="">Font</option>
          <option value='"Noto Sans Devanagari", sans-serif'>Noto Sans</option>
          <option value='"Poppins", sans-serif'>Poppins</option>
          <option value="Georgia, serif">Georgia</option>
          <option value='"Times New Roman", serif'>Times</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value='"Courier New", monospace'>Courier</option>
        </select>
        <select
          aria-label="Font size"
          className="tb-select"
          onChange={(e) => {
            const v = e.target.value;
            const tr = editor.chain().focus();
            if (!v) tr.unsetMark("textStyle").run();
            else tr.setMark("textStyle", { style: `font-size:${v}` }).run();
          }}
          defaultValue=""
        >
          <option value="">Size</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="30px">30</option>
          <option value="36px">36</option>
        </select>
      </Group>

      <Group>
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Btn>
      </Group>

      <Group>
        <label className="tb-color" title="Text color">
          <span style={{ color: (editor.getAttributes("textStyle").color as string) || "#111" }}>A</span>
          <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>
        <label className="tb-color" title="Highlight">
          <span className="bg-yellow-200 px-1">H</span>
          <input type="color" onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
        </label>
      </Group>

      <Group>
        <Btn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left"><AlignLeft className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center"><AlignCenter className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right"><AlignRight className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify"><AlignJustify className="h-4 w-4" /></Btn>
      </Group>

      <Group>
        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered className="h-4 w-4" /></Btn>
        <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="h-4 w-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus className="h-4 w-4" /></Btn>
      </Group>

      <Group>
        <Btn active={editor.isActive("link")} onClick={setLink} title="Link"><LinkIcon className="h-4 w-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link"><Unlink className="h-4 w-4" /></Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Insert Image"><ImageIcon className="h-4 w-4" /></Btn>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickImage} />
        <details ref={emojiRef} className="relative">
          <summary className="tb-btn list-none cursor-pointer"><Smile className="h-4 w-4" /></summary>
          <div className="absolute z-20 mt-1 grid grid-cols-8 gap-1 rounded-md border border-border bg-popover p-2 shadow-elevated">
            {EMOJIS.map((e) => (
              <button key={e} type="button" className="hover:bg-accent rounded px-1" onClick={() => {
                editor.chain().focus().insertContent(e).run();
                emojiRef.current?.removeAttribute("open");
              }}>{e}</button>
            ))}
          </div>
        </details>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="h-4 w-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="h-4 w-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting"><Eraser className="h-4 w-4" /></Btn>
      </Group>

      {imgActive && (
        <Group>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground px-1">Image:</span>
          <Btn onClick={() => setImageAlign("left")} title="Float Left"><AlignLeft className="h-4 w-4" /></Btn>
          <Btn onClick={() => setImageAlign("center")} title="Center / Full"><AlignCenter className="h-4 w-4" /></Btn>
          <Btn onClick={() => setImageAlign("right")} title="Float Right"><AlignRight className="h-4 w-4" /></Btn>
          <Btn onClick={editImageAlt} title="Alt text"><Pilcrow className="h-4 w-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().deleteSelection().run()} title="Delete image"><Eraser className="h-4 w-4" /></Btn>
        </Group>
      )}

      <style>{`
        .tb-btn{display:inline-flex;align-items:center;justify-content:center;height:30px;min-width:30px;padding:0 6px;border-radius:4px;color:var(--foreground);background:transparent;border:1px solid transparent}
        .tb-btn:hover{background:var(--accent)}
        .tb-btn[data-active="true"]{background:var(--primary);color:var(--primary-foreground)}
        .tb-select{height:30px;border:1px solid var(--input);background:var(--background);border-radius:4px;padding:0 4px;font-size:12px}
        .tb-color{position:relative;display:inline-flex;align-items:center;justify-content:center;height:30px;min-width:30px;border-radius:4px;border:1px solid var(--input);cursor:pointer;font-weight:700;background:var(--background)}
        .tb-color input{position:absolute;inset:0;opacity:0;cursor:pointer}
      `}</style>
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 border-r border-border/70 pr-1 mr-1 last:border-r-0">{children}</div>;
}

function Btn({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick: () => void; title: string }) {
  return (
    <button type="button" title={title} aria-label={title} className="tb-btn" data-active={active ? "true" : "false"} onClick={onClick}>
      {children}
    </button>
  );
}
