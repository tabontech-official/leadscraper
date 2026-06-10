import type {
  BusinessSearchInput,
  BusinessSearchResult,
  SearchProvider,
} from "./types";

export class GooglePlacesProvider implements SearchProvider {
  async searchBusinesses(
    input: BusinessSearchInput
  ): Promise<BusinessSearchResult[]> {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured");
    }

    const query = `${input.category} in ${input.zipCode}, ${input.state}`;
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    url.searchParams.set("query", query);
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());

    if (res.status === 429) {
      throw new Error("RATE_LIMIT: Google Places rate limit exceeded");
    }

    if (!res.ok) {
      throw new Error(`Google Places error (${res.status})`);
    }

    const data = (await res.json()) as {
      status: string;
      results?: Array<Record<string, unknown>>;
      error_message?: string;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(
        data.error_message ?? `Google Places status: ${data.status}`
      );
    }

    const results = data.results ?? [];

    return results.slice(0, input.limit).map((place) => ({
      businessName:
        typeof place.name === "string" ? place.name : undefined,
      website: undefined,
      phone: undefined,
      address:
        typeof place.formatted_address === "string"
          ? place.formatted_address
          : undefined,
      state: input.state,
      zipCode: input.zipCode,
      category: input.category,
      googleListingUrl:
        typeof place.place_id === "string"
          ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
          : undefined,
      source: "google_places",
      rawData: place,
    }));
  }
}
