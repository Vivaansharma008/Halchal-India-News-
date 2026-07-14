import { createFileRoute } from "@tanstack/react-router";

const URL = "https://halchalindianews.com/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Halchal India News — Independent Digital News Platform" },
      {
        name: "description",
        content:
          "Halchal India News is an independent digital news platform delivering accurate, unbiased and timely news covering Politics, Business, Technology, Sports, Entertainment and more.",
      },
      { name: "keywords", content: "About Halchal India News, Hindi news portal, independent journalism, latest India news" },
      { property: "og:title", content: "About Halchal India News" },
      { property: "og:description", content: "Independent digital news platform committed to accurate, reliable and unbiased journalism." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="container-news py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">About Halchal India News</h1>
      <p className="text-sm text-muted-foreground mb-8">देश की हर हलचल, सबसे पहले</p>

      <div className="prose-article space-y-5 text-foreground/90 leading-relaxed">
        <p>
          <strong>Halchal India News</strong> is an independent digital news platform committed to
          delivering accurate, reliable, unbiased, and timely news from India and around the world.
          Our mission is to provide trustworthy journalism covering Politics, Business, Technology,
          Sports, Entertainment, Education, Health, Crime, International News, Lifestyle, and
          Breaking News.
        </p>
        <p>
          We believe in factual reporting, transparency, integrity, and serving our readers with
          authentic information. Our goal is to keep every citizen informed with the latest
          developments through a fast, secure, and user-friendly platform.
        </p>

        <h2 className="text-xl font-bold mt-8">Our Mission</h2>
        <p>
          To empower every Indian reader with credible, fact-checked news — free from bias and
          agenda — in both Hindi and English.
        </p>

        <h2 className="text-xl font-bold mt-8">What We Cover</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Politics &amp; Government</li>
          <li>Business &amp; Economy</li>
          <li>Technology &amp; Startups</li>
          <li>Sports &amp; Cricket</li>
          <li>Entertainment &amp; Bollywood</li>
          <li>Education, Health &amp; Lifestyle</li>
          <li>Crime, Uttar Pradesh &amp; Regional</li>
          <li>World &amp; Breaking News</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">Contact</h2>
        <p>
          For queries or feedback, visit our{" "}
          <a href="/contact" className="text-primary underline">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
