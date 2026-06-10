import { GooglePlacesProvider } from "./google-places";
import { SerpApiProvider } from "./serpapi";
import type {
  BusinessSearchInput,
  BusinessSearchResult,
  ProviderName,
  SearchProvider,
} from "./types";

export * from "./types";

export function getSearchProvider(name: ProviderName): SearchProvider {
  switch (name) {
    case "serpapi":
      return new SerpApiProvider();
    case "google_places":
      return new GooglePlacesProvider();
    default:
      throw new Error(`Unknown search provider: ${name}`);
  }
}

export async function searchBusinesses(
  providerName: ProviderName,
  input: BusinessSearchInput
): Promise<BusinessSearchResult[]> {
  const provider = getSearchProvider(providerName);
  return provider.searchBusinesses(input);
}
