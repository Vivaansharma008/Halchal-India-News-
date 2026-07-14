import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/disclaimer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Halchal India News" },
      {
        name: "description",
        content:
          "Disclaimer for Halchal India News — news accuracy, editorial policy, external links, fair use, copyright notice and limitation of liability.",
      },
      { property: "og:title", content: "Disclaimer — Halchal India News" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Disclaimer</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <div className="prose-article space-y-4 leading-relaxed text-foreground/90">
        <h2 className="text-xl font-bold">1. News Accuracy</h2>
        <p>
          Halchal India News strives to publish accurate and up-to-date information. However, we
          make no warranty regarding completeness, reliability, or accuracy of any content
          published on this website.
        </p>

        <h2 className="text-xl font-bold">2. Editorial Policy</h2>
        <p>
          Our editorial team works independently to ensure balanced reporting. Opinions expressed
          in editorials, blogs, or opinion pieces are those of the authors and do not necessarily
          reflect the views of Halchal India News.
        </p>

        <h2 className="text-xl font-bold">3. External Links</h2>
        <p>
          Our website may contain links to external websites. We are not responsible for the
          content, accuracy, or practices of those third-party sites.
        </p>

        <h2 className="text-xl font-bold">4. Fair Use</h2>
        <p>
          Some content on this site may be used under the doctrine of "fair use" for the purpose
          of news reporting, commentary, and education. Copyright remains with the respective
          owners.
        </p>

        <h2 className="text-xl font-bold">5. Copyright Notice</h2>
        <p>
          All original content on Halchal India News is protected by copyright. If you believe any
          content infringes your copyright, please contact us for immediate action.
        </p>

        <h2 className="text-xl font-bold">6. Limitation of Liability</h2>
        <p>
          Halchal India News, its editors, or contributors shall not be held liable for any loss
          or damage arising from the use of information published on this website.
        </p>

        <h2 className="text-xl font-bold">7. Contact Information</h2>
        <p>
          Email: <a href="mailto:halchalindianews24@gmail.com" className="text-primary underline">halchalindianews24@gmail.com</a>
          <br />
          Phone: <a href="tel:+918791679847" className="text-primary underline">+91 8791679847</a>
        </p>
      </div>
    </main>
  );
}
