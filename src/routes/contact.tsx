import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle, Facebook } from "lucide-react";

const URL = "https://halchalindianews.com/contact";
const PHONE = "+91 8791679847";
const PHONE_TEL = "tel:+918791679847";
const EMAIL = "halchalindianews24@gmail.com";
const WHATSAPP = "https://wa.me/918791679847";
const FACEBOOK = "https://www.facebook.com/halchalindianews";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Halchal India News" },
      {
        name: "description",
        content:
          "Contact Halchal India News — reach us by phone +91 8791679847, email halchalindianews24@gmail.com, WhatsApp or Facebook for news tips, feedback and advertising.",
      },
      { name: "keywords", content: "Contact Halchal India News, news tip, advertising, halchalindianews24@gmail.com" },
      { property: "og:title", content: "Contact Us — Halchal India News" },
      { property: "og:description", content: "Get in touch with the Halchal India News team." },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const body =
      `Name: ${parsed.data.name}%0AEmail: ${parsed.data.email}%0A%0A${encodeURIComponent(parsed.data.message)}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Contact — " + parsed.data.name)}&body=${body}`;
    setTimeout(() => setSubmitting(false), 1500);
  }

  return (
    <main className="container-news py-10 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Contact Us</h1>
      <p className="text-sm text-muted-foreground mb-8">
        We'd love to hear from you — news tips, advertising or feedback.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold mb-4">Reach us directly</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <a href={PHONE_TEL} className="hover:text-primary">{PHONE}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <a href={`mailto:${EMAIL}`} className="hover:text-primary break-all">{EMAIL}</a>
              </li>
              <li className="flex items-start gap-3">
                <Facebook className="h-5 w-5 text-primary mt-0.5" />
                <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="hover:text-primary">facebook.com/halchalindianews</a>
              </li>
            </ul>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a href={PHONE_TEL}
                 className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a href={`mailto:${EMAIL}`}
                 className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition">
                <Mail className="h-4 w-4" /> Email
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
               className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#25D366]/10 border border-[#25D366]/30 px-4 py-2.5 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366] hover:text-white transition">
              💬 Contact Us on WhatsApp
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold mb-1">Send a message</h2>
          <div>
            <label className="text-sm font-semibold">Name</label>
            <input name="name" required maxLength={100}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input name="email" type="email" required maxLength={200}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold">Message</label>
            <textarea name="message" required rows={5} maxLength={2000}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
