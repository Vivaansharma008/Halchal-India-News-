import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AdSlot } from "@/components/site/AdSlot";

import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-xl font-semibold">पेज नहीं मिला</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            आपके द्वारा खोजा गया पृष्ठ मौजूद नहीं है।
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            होम पर वापस जाएँ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">पेज लोड नहीं हो सका</h1>
          <p className="mt-2 text-sm text-muted-foreground">कृपया पुनः प्रयास करें।</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
            >
              पुनः प्रयास करें
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              होम
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const ADSENSE_CLIENT =
  (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined) ?? "";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Halchal India — ताज़ा हिंदी समाचार, राजनीति, खेल, मनोरंजन" },
      {
        name: "description",
        content:
          "Halchal India पर पढ़ें भारत और दुनिया की ताज़ा हिंदी खबरें — राजनीति, खेल, मनोरंजन, टेक्नोलॉजी और उत्तर प्रदेश की हर बड़ी हलचल।",
      },
      { property: "og:site_name", content: "Halchal India" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#b91c1c" },
      { property: "og:title", content: "Halchal India — ताज़ा हिंदी समाचार" },
      { name: "twitter:title", content: "Halchal India — ताज़ा हिंदी समाचार" },
      { property: "og:description", content: "Halchal India News — professional Hindi news portal: breaking news, latest updates, categorized articles." },
      { name: "twitter:description", content: "Halchal India News — professional Hindi news portal." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          name: "Halchal India News",
          url: "https://halchalindianews.com",
          email: "halchalindianews24@gmail.com",
          telephone: "+91-8791679847",
          logo: "https://halchalindianews.com/favicon.ico",
          sameAs: [],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Halchal India News",
          url: "https://halchalindianews.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://halchalindianews.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      ...(ADSENSE_CLIENT
        ? [
            {
              async: true,
              src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
              crossOrigin: "anonymous" as const,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED")
        return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container-news pt-3">
          <AdSlot position="header" variant="banner" label="Advertisement" />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
        <div className="container-news pb-3">
          <AdSlot position="above_footer" variant="banner" label="Sponsored" />
        </div>
        <Footer />
      </div>
<Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
