export const CATEGORIES = [
  { slug: "national", label: "राष्ट्रीय" },
  { slug: "uttar-pradesh", label: "उत्तर प्रदेश" },
  { slug: "politics", label: "राजनीति" },
  { slug: "crime", label: "क्राइम" },
  { slug: "sports", label: "खेल" },
  { slug: "entertainment", label: "मनोरंजन" },
  { slug: "business", label: "बिज़नेस" },
  { slug: "technology", label: "टेक्नोलॉजी" },
  { slug: "education", label: "शिक्षा" },
  { slug: "health", label: "हेल्थ" },
  { slug: "world", label: "विश्व" },
  { slug: "lifestyle", label: "लाइफस्टाइल" },
  { slug: "auto", label: "ऑटो" },
  { slug: "jobs", label: "जॉब्स" },
  { slug: "fact-check", label: "फैक्ट चेक" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_LABELS: Record<CategorySlug, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.slug]: c.label }),
  {} as Record<CategorySlug, string>,
);

export function isValidCategory(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}
