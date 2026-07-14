import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Bot,
  Copy,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  ThumbsUp,
  ThumbsDown,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const STORAGE_KEY = "halchal-ai-chat-v1";

const SUGGESTED = [
  "आज की टॉप न्यूज़ क्या है?",
  "उत्तर प्रदेश की ताज़ा खबरें",
  "मेरठ की खबरें",
  "क्रिकेट की ताज़ा खबरें",
  "टेक्नोलॉजी की खबरें",
  "मनोरंजन जगत से खबरें",
];

function loadHistory(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

function messageText(m: UIMessage): string {
  return (
    m.parts
      ?.map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
      .join("") ?? ""
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setInitialMessages(loadHistory());
  }, []);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai-chat" }),
    [],
  );

  const { messages, sendMessage, status, setMessages, regenerate, stop, error } =
    useChat({
      transport,
      messages: initialMessages,
      onError: () =>
        toast.error("जवाब लोड नहीं हो सका, कृपया पुनः प्रयास करें"),
    });

  // Persist locally
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const busy = status === "submitted" || status === "streaming";

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function clearChat() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setFeedback({});
    toast.success("चैट साफ़ हो गई");
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      toast.error("कॉपी नहीं हो सका");
    }
  }

  function speak(id: string, text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("आपके ब्राउज़र में यह सुविधा नहीं है");
      return;
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\[(.*?)\]\(.*?\)/g, "$1"));
    u.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    u.onend = () => setSpeakingId((c) => (c === id ? null : c));
    u.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(u);
  }

  function toggleMic() {
    const SR: any =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      toast.error("वॉइस इनपुट इस ब्राउज़र में उपलब्ध नहीं है");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
      }
      setInput(txt);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          aria-label="AI न्यूज़ असिस्टेंट खोलें"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 group"
        >
          <span className="absolute inset-0 rounded-full bg-[#C80000] opacity-60 animate-ping" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#C80000] to-[#8a0000] text-white shadow-elevated ring-4 ring-white transition group-hover:scale-110">
            <Sparkles className="h-6 w-6" />
          </span>
          <span className="absolute -top-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#C80000] ring-1 ring-[#C80000]/30">
            AI
          </span>
        </button>
      )}

      {/* Backdrop + Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Halchal AI असिस्टेंट"
            className="relative m-0 sm:m-4 flex h-[85vh] sm:h-[640px] w-full sm:w-[420px] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white/95 backdrop-blur-xl shadow-elevated ring-1 ring-black/5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#C80000] to-[#8a0000] text-white">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-tight">Halchal AI</div>
                <div className="text-[11px] opacity-90 leading-tight">
                  आपका न्यूज़ असिस्टेंट • हिंदी / English
                </div>
              </div>
              <button
                type="button"
                aria-label="चैट साफ़ करें"
                onClick={clearChat}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15 transition"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="बंद करें"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-gradient-to-b from-white to-neutral-50"
            >
              {messages.length === 0 && (
                <div className="text-center px-2">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#C80000]/10 text-[#C80000]">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="mt-3 font-bold text-neutral-900">
                    नमस्ते! मैं Halchal AI हूँ
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    ताज़ा खबरें, समाचार सारांश, या कोई भी सवाल पूछें
                  </p>
                  <div className="mt-4 grid gap-1.5">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:border-[#C80000] hover:bg-[#C80000]/5 transition"
                      >
                        <Sparkles className="inline h-3 w-3 mr-1.5 text-[#C80000]" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => {
                const text = messageText(m);
                const isUser = m.role === "user";
                const isLast = i === messages.length - 1;
                if (isUser) {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#C80000] px-3.5 py-2 text-sm text-white shadow-sm">
                        {text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="flex gap-2">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C80000]/10 text-[#C80000]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm ring-1 ring-neutral-200">
                        {text ? (
                          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-a:text-[#C80000] prose-a:font-semibold prose-ul:my-1.5 prose-strong:text-neutral-900">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target={
                                      href?.startsWith("/") ? "_self" : "_blank"
                                    }
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <TypingDots />
                        )}
                      </div>
                      {text && (
                        <div className="mt-1 flex items-center gap-0.5 pl-1">
                          <IconBtn
                            label="Copy"
                            onClick={() => copy(m.id, text)}
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </IconBtn>
                          <IconBtn
                            label={speakingId === m.id ? "रोकें" : "सुनें"}
                            onClick={() => speak(m.id, text)}
                          >
                            {speakingId === m.id ? (
                              <VolumeX className="h-3.5 w-3.5" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </IconBtn>
                          {isLast && !busy && (
                            <IconBtn
                              label="फिर से जवाब"
                              onClick={() => regenerate()}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </IconBtn>
                          )}
                          <IconBtn
                            label="अच्छा"
                            onClick={() =>
                              setFeedback((f) => ({ ...f, [m.id]: "up" }))
                            }
                            active={feedback[m.id] === "up"}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn
                            label="ठीक नहीं"
                            onClick={() =>
                              setFeedback((f) => ({ ...f, [m.id]: "down" }))
                            }
                            active={feedback[m.id] === "down"}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {busy && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#C80000]/10 text-[#C80000]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-neutral-200">
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-xs text-red-600">
                  त्रुटि हुई — कृपया पुनः प्रयास करें
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-neutral-200 bg-white/80 backdrop-blur px-3 py-2.5">
              <div className="flex items-end gap-2 rounded-2xl bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#C80000] transition px-3 py-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={listening ? "रिकॉर्डिंग रोकें" : "बोलकर पूछें"}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${
                    listening
                      ? "bg-[#C80000] text-white animate-pulse"
                      : "text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {listening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="कुछ भी पूछें..."
                  className="flex-1 resize-none bg-transparent outline-none text-sm max-h-28 py-1"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    aria-label="रोकें"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-800 text-white hover:bg-black transition"
                  >
                    <span className="h-3 w-3 rounded-sm bg-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => send(input)}
                    disabled={!input.trim()}
                    aria-label="भेजें"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C80000] text-white hover:bg-[#a30000] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-center text-[10px] text-neutral-400">
                Halchal AI गलतियाँ कर सकता है • महत्वपूर्ण जानकारी सत्यापित करें
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-full transition ${
        active
          ? "bg-[#C80000]/10 text-[#C80000]"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#C80000] animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#C80000] animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#C80000] animate-bounce" />
    </div>
  );
}
