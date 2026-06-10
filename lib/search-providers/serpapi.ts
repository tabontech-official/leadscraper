import type {
  BusinessSearchInput,
  BusinessSearchResult,
  SearchProvider,
} from "./types";

export class SerpApiProvider implements SearchProvider {
  async searchBusinesses(
    input: BusinessSearchInput
  ): Promise<BusinessSearchResult[]> {
    const key = process.env.SERPAPI_KEY;
    if (!key) {
      throw new Error("SERPAPI_KEY is not configured");
    }

    const q = `${input.category} near ${input.zipCode}, ${input.state}`;
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_maps");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "search");
    url.searchParams.set("api_key", key);

    const res = await fetch(url.toString());

    if (res.status === 429) {
      throw new Error("RATE_LIMIT: SerpAPI rate limit exceeded");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SerpAPI error (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      local_results?: Array<Record<string, unknown>>;
      place_results?: Array<Record<string, unknown>>;
      error?: string;
    };

    if (data.error) {
      throw new Error(`SerpAPI: ${data.error}`);
    }

    const places =
      data.local_results ?? data.place_results ?? [];

    return places.slice(0, input.limit).map((p) => mapPlace(p, input));
  }
}

function mapPlace(
  p: Record<string, unknown>,
  input: BusinessSearchInput
): BusinessSearchResult {
  const address = typeof p.address === "string" ? p.address : undefined;
  const parts = address?.split(",").map((s) => s.trim()) ?? [];

  return {
    businessName: typeof p.title === "string" ? p.title : undefined,
    website: typeof p.website === "string" ? p.website : undefined,
    phone: typeof p.phone === "string" ? p.phone : undefined,
    address,
    city: parts[0],
    state: input.state,
    zipCode: input.zipCode,
    category: input.category,
    googleListingUrl:
      typeof p.link === "string"
        ? p.link
        : typeof p.place_id_search === "string"
          ? p.place_id_search
          : undefined,
    source: "serpapi",
    rawData: p,
  };
}
