import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Halchal India News" },
      {
        name: "description",
        content:
          "Privacy Policy of Halchal India News — how we collect, use, protect information, and details about cookies, Google AdSense, third-party ads, analytics and user rights.",
      },
      { property: "og:title", content: "Privacy Policy — Halchal India News" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <p>
          Halchal India News ("we", "us", "our") respects your privacy. This Privacy Policy
          explains how we collect, use, and safeguard your information when you visit our website.
        </p>

        <h2 className="text-xl font-bold">1. Information We Collect</h2>
        <p>
          We may collect non-personal information such as browser type, device, IP address, pages
          viewed, and referring URL. We also collect information you voluntarily provide through
          contact forms (name, email, message).
        </p>

        <h2 className="text-xl font-bold">2. Cookies</h2>
        <p>
          We use cookies to improve user experience, remember preferences, and analyse traffic. You
          can disable cookies from your browser settings at any time.
        </p>

        <h2 className="text-xl font-bold">3. Google AdSense</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on your prior
          visits to our website or other websites. Google's use of advertising cookies enables it
          and its partners to serve ads to our users based on their visit. You may opt out of
          personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
             className="text-primary underline">Google Ads Settings</a>.
        </p>

        <h2 className="text-xl font-bold">4. Third-party Advertising</h2>
        <p>
          Other third-party ad networks may also be used. These networks may collect information
          about your visits to this and other websites to provide relevant advertisements.
        </p>

        <h2 className="text-xl font-bold">5. Analytics</h2>
        <p>
          We use analytics tools (such as Google Analytics) to understand how visitors interact
          with our site. These tools use cookies and collect aggregated, anonymised data.
        </p>

        <h2 className="text-xl font-bold">6. Data Security</h2>
        <p>
          We follow reasonable industry practices to protect the information we collect. However,
          no method of transmission over the Internet is 100% secure.
        </p>

        <h2 className="text-xl font-bold">7. User Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of your personal
          information. Please contact us to exercise these rights.
        </p>

        <h2 className="text-xl font-bold">8. Contact Information</h2>
        <p>
          Email: <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>
          <br />
          Phone: <a href="tel:+918791679847" className="text-primary underline">+91 8791679847</a>
        </p>
      </div>
    </main>
  );
}
