import { createServerFn } from "@tanstack/react-start";

export type Quote = {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePct: number;
};

async function fetchYahoo(symbol: string, label: string): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    const q = json?.quoteResponse?.result?.[0];
    if (!q || typeof q.regularMarketPrice !== "number") return null;
    return {
      symbol,
      label,
      price: q.regularMarketPrice,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
    };
  } catch {
    return null;
  }
}

export const getMarketQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const [nifty, sensex] = await Promise.all([
    fetchYahoo("^NSEI", "NIFTY"),
    fetchYahoo("^BSESN", "SENSEX"),
  ]);
  return { nifty, sensex, fetchedAt: Date.now() };
});
