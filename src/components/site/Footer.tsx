import { Link } from "@tanstack/react-router";
import { Facebook, Mail, Phone, MessageCircle, Twitter, Youtube, Instagram, Send } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useState } from "react";

const PHONE = "+91 8791679847";
const PHONE_TEL = "tel:+918791679847";
const EMAIL = "halchalindianews24@gmail.com";
const WHATSAPP = "https://wa.me/918791679847";
const FACEBOOK = "https://www.facebook.com/halchalindianews";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <footer className="mt-20 relative overflow-hidden">
      {/* Newsletter band */}
      <div className="container-news">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark p-8 md:p-12 shadow-float ring-1 ring-black/5">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] items-center">
            <div className="text-primary-foreground">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
                रोज़ाना ताज़ा ख़बरें — सीधे आपके इनबॉक्स में
              </h2>
              <p className="mt-2 text-sm md:text-base opacity-90 max-w-xl">
                भारत की हर बड़ी हलचल, हर सुबह — मुफ़्त न्यूज़लेटर के साथ।
              </p>
            </div>
            <form onSubmit={submit} className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur p-1.5 shadow-elevated ring-1 ring-white/40">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark active:scale-95 transition"
              >
                {subscribed ? "✓ जुड़ गए" : (<><Send className="h-3.5 w-3.5" /> सब्सक्राइब</>)}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border/60 bg-card/60 backdrop-blur">
        <div className="container-news py-12 grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-display font-extrabold shadow-glow-red">
                हI
              </div>
              <span className="text-lg font-display font-extrabold tracking-tight">Halchal India News</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              देश की हर हलचल, सबसे पहले — राजनीति, खेल, मनोरंजन और तकनीक की भरोसेमंद पत्रकारिता।
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: FACEBOOK, icon: Facebook, label: "Facebook" },
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
                { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
                { href: WHATSAPP, icon: MessageCircle, label: "WhatsApp" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/80 hover:text-primary-foreground hover:bg-primary hover:-translate-y-0.5 transition-all shadow-card"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-display font-bold mb-4 tracking-tight">श्रेणियाँ</h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.slice(0, 8).map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$category" params={{ category: c.slug }}
                        className="text-muted-foreground hover:text-primary hover:translate-x-0.5 inline-block transition">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-display font-bold mb-4 tracking-tight">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition">Contact Us</Link></li>
              <li><Link to="/editorial-policy" className="text-muted-foreground hover:text-primary transition">Editorial Policy</Link></li>
              <li><Link to="/corrections-policy" className="text-muted-foreground hover:text-primary transition">Corrections Policy</Link></li>
              <li><Link to="/fact-checking-policy" className="text-muted-foreground hover:text-primary transition">Fact-Checking Policy</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition">Terms &amp; Conditions</Link></li>
              <li><Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-display font-bold mb-4 tracking-tight">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href={PHONE_TEL} className="text-muted-foreground hover:text-primary">{PHONE}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-primary break-all">{EMAIL}</a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">WhatsApp Chat</a>
              </li>
              <li className="flex items-start gap-2">
                <Facebook className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Facebook Page</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60">
          <div className="container-news py-5 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Halchal India News. All Rights Reserved.
            </p>
            <p className="mt-1.5 text-[11px] sm:text-xs font-medium tracking-wide text-muted-foreground/80">
              Created by{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-semibold text-transparent">
                Vivaan Sharma
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
