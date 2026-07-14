import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Halchal India News" },
      {
        name: "description",
        content:
          "Terms & Conditions for using Halchal India News — acceptance, website usage, user responsibilities, copyright, intellectual property and limitation of liability.",
      },
      { property: "og:title", content: "Terms & Conditions — Halchal India News" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Halchal India News, you agree to be bound by these Terms &amp;
          Conditions. If you do not agree, please do not use this website.
        </p>

        <h2 className="text-xl font-bold">2. Website Usage</h2>
        <p>
          You may use this website for lawful, personal, non-commercial purposes only. Any misuse
          or unauthorised access is strictly prohibited.
        </p>

        <h2 className="text-xl font-bold">3. User Responsibilities</h2>
        <p>
          Users are responsible for the content they submit through comments, contact forms, or any
          interactive feature. Content must not be unlawful, defamatory, obscene, or harmful.
        </p>

        <h2 className="text-xl font-bold">4. Copyright</h2>
        <p>
          All articles, images, videos, graphics, and content published on Halchal India News are
          the property of Halchal India News unless otherwise stated. Unauthorised reproduction is
          prohibited.
        </p>

        <h2 className="text-xl font-bold">5. Intellectual Property</h2>
        <p>
          The Halchal India News name, logo, and branding are protected intellectual property. You
          may not use them without prior written permission.
        </p>

        <h2 className="text-xl font-bold">6. Third-party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the
          content, policies or practices of those websites.
        </p>

        <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
        <p>
          Halchal India News is not liable for any direct, indirect, incidental or consequential
          damages arising out of the use of this website or reliance on its content.
        </p>

        <h2 className="text-xl font-bold">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the website
          after changes constitutes acceptance of the revised terms.
        </p>
      </div>
    </main>
  );
}
