"use server";

export interface GoldPrice {
  karat: string;
  sell: number;
  buy: number;
}

export interface PricesResult {
  success: boolean;
  prices: GoldPrice[];
  timestamp: string;
  error?: string;
}

// Fallback prices based on JJSJO recent historical figures to prevent app crash if site is down
const FALLBACK_PRICES: GoldPrice[] = [
  { karat: "24K", sell: 105.7, buy: 101.5 },
  { karat: "21K", sell: 92.1, buy: 87.7 },
  { karat: "18K", sell: 81.6, buy: 75.0 },
  { karat: "14K", sell: 66.4, buy: 58.2 }
];

/**
 * Server Action to fetch gold prices from JJSJO website
 * Short caching of 5 minutes (300 seconds) is used to support multiple daily updates.
 */
export async function fetchGoldPrices(): Promise<PricesResult> {
  try {
    const response = await fetch("https://jjsjo.com/", {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      next: {
        revalidate: 300 // Cache for 5 minutes (300s) to absorb spike traffic while remaining up-to-date
      }
    });

    if (!response.ok) {
      throw new Error(`Syndicate site responded with status: ${response.status}`);
    }

    const html = await response.text();
    const prices = parsePrices(html);

    if (prices.length === 0) {
      throw new Error("Could not parse prices from syndicate page layout.");
    }

    return {
      success: true,
      prices,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error scraping gold prices from JJSJO:", error);
    return {
      success: false,
      prices: FALLBACK_PRICES,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error occurred during scraping"
    };
  }
}

/**
 * Parses the prices from the JJSJO HTML table.
 * Custom built using HTML structural parsing via regex to maintain a Zero-Dependency backend.
 */
function parsePrices(html: string): GoldPrice[] {
  const prices: GoldPrice[] = [];
  
  // Extract content between <tbody> and </tbody>
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];
  
  const tbodyHtml = tbodyMatch[1];
  
  // Regular expressions to iterate over <tr> and <td[^>]*>
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  
  let trMatch;
  while ((trMatch = trRegex.exec(tbodyHtml)) !== null) {
    const rowHtml = trMatch[1];
    const cells: string[] = [];
    let tdMatch;
    
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      // Strip any nested tags (like spans or images) and get the plain text
      const cleanContent = tdMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
      cells.push(cleanContent);
    }
    
    // We expect at least: [Karat, Sell Price, Buy Price]
    if (cells.length >= 3) {
      const karatRaw = cells[0];
      const sellVal = parseFloat(cells[1]);
      const buyVal = parseFloat(cells[2]);
      
      const karat = karatRaw.replace(/\s+/g, "").toUpperCase(); // e.g. "24 K" -> "24K"
      
      if (karat.includes("K") && !isNaN(sellVal) && !isNaN(buyVal)) {
        prices.push({
          karat,
          sell: sellVal,
          buy: buyVal
        });
      }
    }
  }
  
  return prices;
}
