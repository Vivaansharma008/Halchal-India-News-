import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/corrections-policy";

export const Route = createFileRoute("/corrections-policy")({
  head: () => ({
    meta: [
      { title: "Corrections Policy — Halchal India News" },
      {
        name: "description",
        content:
          "Corrections Policy of Halchal India News — how we handle errors, issue corrections, updates and clarifications transparently.",
      },
      { property: "og:title", content: "Corrections Policy — Halchal India News" },
      { property: "og:description", content: "How we correct errors and update articles transparently." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: CorrectionsPolicyPage,
});

function CorrectionsPolicyPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Corrections Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <p>
          Halchal India News is committed to accuracy. When we get something wrong, we correct
          it quickly, clearly and transparently.
        </p>

        <h2 className="text-xl font-bold">1. Reporting an Error</h2>
        <p>
          If you believe an article contains a factual error, please email{" "}
          <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>{" "}
          with the article URL and a description of the issue. Every article page also carries
          a "Report an Error" link for one-click reporting.
        </p>

        <h2 className="text-xl font-bold">2. How We Handle Corrections</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Minor typos and grammatical fixes are corrected silently.</li>
          <li>
            Factual errors are corrected in-line, with an editor's note at the bottom of the
            article describing what was changed and when.
          </li>
          <li>
            Substantive updates (new information, evolving story) are labelled with an updated
            timestamp at the top of the article.
          </li>
          <li>
            Serious errors that materially change the meaning of a story are corrected
            immediately, flagged prominently, and the correction is retained in the article.
          </li>
        </ul>

        <h2 className="text-xl font-bold">3. Removal Requests</h2>
        <p>
          We do not unpublish accurate news reports. In rare cases (legal orders, safety concerns,
          copyright takedowns), we may remove or redact content and add a note explaining the
          action.
        </p>

        <h2 className="text-xl font-bold">4. Timeliness</h2>
        <p>
          We aim to acknowledge every correction request within 48 hours and to publish a
          correction, if warranted, as soon as our editors have verified the facts.
        </p>

        <h2 className="text-xl font-bold">5. Contact</h2>
        <p>
          Email: <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>
          <br />
          Phone: <a href="tel:+918791679847" className="text-primary underline">+91 8791679847</a>
        </p>
      </div>
    </main>
  );
}
