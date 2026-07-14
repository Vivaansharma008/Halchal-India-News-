import type { AdPosition } from "./ads.functions";

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  header: "हेडर के नीचे (Below Header)",
  between_sections: "अनुभागों के बीच (Between Sections)",
  sidebar: "साइडबार (Sidebar)",
  in_article: "लेख के अंदर (Inside Article)",
  above_footer: "फुटर के ऊपर (Above Footer)",
};

export const AD_POSITIONS: AdPosition[] = [
  "header",
  "between_sections",
  "sidebar",
  "in_article",
  "above_footer",
];
