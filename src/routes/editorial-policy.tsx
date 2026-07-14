import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/editorial-policy";

export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy — Halchal India News" },
      {
        name: "description",
        content:
          "Editorial Policy of Halchal India News — our commitment to accuracy, independence, transparency, sourcing standards, and ethical journalism.",
      },
      { property: "og:title", content: "Editorial Policy — Halchal India News" },
      { property: "og:description", content: "Our editorial standards, sourcing rules, independence and ethics." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: EditorialPolicyPage,
});

function EditorialPolicyPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Editorial Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <p>
          Halchal India News is committed to accurate, fair, independent and ethical journalism.
          This Editorial Policy explains how our newsroom decides what to publish and how we
          maintain the trust of our readers.
        </p>

        <h2 className="text-xl font-bold">1. Accuracy</h2>
        <p>
          Every story is verified from multiple credible sources before publication. Where facts
          cannot be independently confirmed, we clearly say so. Errors are corrected promptly
          and transparently — see our{" "}
          <a href="/corrections-policy" className="text-primary underline">Corrections Policy</a>.
        </p>

        <h2 className="text-xl font-bold">2. Independence</h2>
        <p>
          Our editorial decisions are made independently of advertisers, political parties, and
          commercial partners. No advertiser or sponsor influences the content, angle, or
          placement of a news story.
        </p>

        <h2 className="text-xl font-bold">3. Sourcing</h2>
        <p>
          We prefer named, on-the-record sources. Anonymous sources are used only when
          necessary to protect the source and when the information is of clear public interest.
          Wire-service and syndicated content is credited.
        </p>

        <h2 className="text-xl font-bold">4. Fairness &amp; Balance</h2>
        <p>
          We seek comment from all parties involved in a story. Opinion, analysis and reporting
          are clearly labelled and kept separate.
        </p>

        <h2 className="text-xl font-bold">5. Transparency</h2>
        <p>
          Every article carries the author's name, published date and (where updated) the last
          modified date. Sponsored content, if any, is clearly marked.
        </p>

        <h2 className="text-xl font-bold">6. Diversity &amp; Sensitivity</h2>
        <p>
          We report with sensitivity toward gender, caste, religion, region and community. We do
          not publish hate speech, defamatory content, or material that promotes violence.
        </p>

        <h2 className="text-xl font-bold">7. Contact the Editor</h2>
        <p>
          For editorial feedback, story tips or complaints, email{" "}
          <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>{" "}
          or call <a href="tel:+918791679847" className="text-primary underline">+91 8791679847</a>.
        </p>
      </div>
    </main>
  );
}
