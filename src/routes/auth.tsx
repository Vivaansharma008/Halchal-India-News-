import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "एडमिन लॉगिन — Halchal India " },
      { name: "description", content: "Halchal India  एडमिन पैनल लॉगिन।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("लॉगिन सफल");
      navigate({ to: "/admin" });
    } catch {
      toast.error("लॉगिन विफल। कृपया अपनी जानकारी जाँचें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-news py-16 flex justify-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-elevated">
        <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-center">एडमिन पैनल</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          समाचार प्रबंधन के लिए लॉगिन करें
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">ईमेल</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">पासवर्ड</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "कृपया प्रतीक्षा करें..." : "लॉगिन"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          यह केवल अधिकृत एडमिन के लिए है। नया खाता एडमिन द्वारा बनाया जाता है।
        </p>
      </div>
    </div>
  );
}
