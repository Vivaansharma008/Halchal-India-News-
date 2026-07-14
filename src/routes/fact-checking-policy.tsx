import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/fact-checking-policy";

export const Route = createFileRoute("/fact-checking-policy")({
  head: () => ({
    meta: [
      { title: "Fact-Checking Policy — Halchal India News" },
      {
        name: "description",
        content:
          "Fact-Checking Policy of Halchal India News — our verification process, sourcing standards, misinformation handling and non-partisanship commitment.",
      },
      { property: "og:title", content: "Fact-Checking Policy — Halchal India News" },
      { property: "og:description", content: "How we verify facts, sources and claims before publishing." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: FactCheckingPolicyPage,
});

function FactCheckingPolicyPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Fact-Checking Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <p>
          Halchal India News is committed to publishing verified, accurate information. Our
          reporters and editors follow a structured fact-checking process before any story goes
          live.
        </p>

        <h2 className="text-xl font-bold">1. Verification Standards</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Every factual claim is verified from at least two independent, credible sources.</li>
          <li>Primary sources (official statements, court documents, government data) are preferred over secondary reporting.</li>
          <li>Images and videos are verified for authenticity, date and location before publication.</li>
          <li>Data and statistics are cross-checked against the original source.</li>
        </ul>

        <h2 className="text-xl font-bold">2. Sources</h2>
        <p>
          We rely on official government releases, court records, verified press conferences,
          reputable wire services, and on-the-record interviews. Social-media content is treated
          as a lead, not as evidence, until independently verified.
        </p>

        <h2 className="text-xl font-bold">3. Handling Misinformation</h2>
        <p>
          We do not amplify unverified rumours. When we cover a viral claim to debunk or
          contextualise it, we label the story clearly and provide evidence for our conclusions.
        </p>

        <h2 className="text-xl font-bold">4. Non-partisanship &amp; Fairness</h2>
        <p>
          Our fact-checking is non-partisan. We apply the same verification standard to
          statements from every political party, government, business or public figure.
        </p>

        <h2 className="text-xl font-bold">5. Corrections</h2>
        <p>
          If a published story is later found to contain an error, we correct it in accordance
          with our{" "}
          <a href="/corrections-policy" className="text-primary underline">Corrections Policy</a>.
        </p>

        <h2 className="text-xl font-bold">6. Contact Our Fact-Check Desk</h2>
        <p>
          To flag a story for verification or to report misinformation:
          <br />
          Email: <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>
          <br />
          Phone: <a href="tel:+918791679847" className="text-primary underline">+91 8791679847</a>
        </p>
      </div>
    </main>
  );
}
