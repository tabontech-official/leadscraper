export interface BusinessSearchInput {
  zipCode: string;
  category: string;
  state: string;
  limit: number;
}

export interface BusinessSearchResult {
  businessName?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category?: string;
  googleListingUrl?: string;
  source: string;
  rawData?: unknown;
}

export interface SearchProvider {
  searchBusinesses(input: BusinessSearchInput): Promise<BusinessSearchResult[]>;
}

export type ProviderName = "serpapi" | "google_places";
