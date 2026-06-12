import axios from "axios";
import * as cheerio from "cheerio";
import { DEFAULT_SOURCES } from "./sources";
import { parsePartnerProfileHtml, validateLead } from "./extractors";
import { isDuplicateLead } from "./deduplication";
import { prisma } from "@/lib/db";

export interface ScrapeResult {
  success: boolean;
  totalSourcesChecked: number;
  totalLeadsFound: number;
  newLeadsSaved: number;
  duplicatesSkipped: number;
  failedSources: number;
  errors: string[];
}

export interface ScraperOptions {
  limit?: number;
  continueFromLast?: boolean;
  selectedSources?: string[];
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SOURCE_MAP: Record<string, string> = {
  "US": "https://www.shopify.com/partners/directory/locations/united-states",
  "CA": "https://www.shopify.com/partners/directory/locations/canada",
  "UK": "https://www.shopify.com/partners/directory/locations/united-kingdom",
  "AU": "https://www.shopify.com/partners/directory/locations/australia",
  "IN": "https://www.shopify.com/partners/directory/locations/india"
};

export async function runShopifyExpertsScraper(
  userId: string,
  urls?: string[],
  options?: ScraperOptions
): Promise<ScrapeResult> {
  // Determine source list
  let sourcesToCheck = DEFAULT_SOURCES;
  if (urls && urls.length > 0) {
    sourcesToCheck = urls;
  } else if (options?.selectedSources && options.selectedSources.length > 0) {
    sourcesToCheck = options.selectedSources.map(s => SOURCE_MAP[s] || s);
  }
  
  let totalSourcesChecked = 0;
  let totalLeadsFound = 0;
  let newLeadsSaved = 0;
  let duplicatesSkipped = 0;
  let failedSources = 0;
  const errors: string[] = [];

  const profileUrlsToScrape: string[] = [];

  // Phase 1: Discover profile URLs from sources
  for (const sourceUrl of sourcesToCheck) {
    try {
      totalSourcesChecked++;
      
      // If it's an individual partner page, add it directly
      if (sourceUrl.includes("/partners/directory/partner/") && sourceUrl !== "https://www.shopify.com/partners/directory/partner/") {
        profileUrlsToScrape.push(sourceUrl);
        continue;
      }

      console.log(`[Scraper] Fetching index source: ${sourceUrl}`);
      const response = await axios.get(sourceUrl, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      let pageLinksCount = 0;

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/partners/directory/partner/") && href !== "/partners/directory/partner/") {
          const absoluteUrl = href.startsWith("http") 
            ? href 
            : `https://www.shopify.com${href}`;
          profileUrlsToScrape.push(absoluteUrl);
          pageLinksCount++;
        }
      });

      console.log(`[Scraper] Found ${pageLinksCount} profile links in ${sourceUrl}`);
    } catch (err: any) {
      failedSources++;
      console.error(`[Scraper] Failed to fetch source ${sourceUrl}:`, err.message);
      errors.push(`Failed to fetch source ${sourceUrl}: ${err.message}`);
    }
  }

  // Deduplicate discovered profile URLs
  const uniqueProfileUrls = Array.from(new Set(profileUrlsToScrape));
  totalLeadsFound = uniqueProfileUrls.length;

  console.log(`[Scraper] Total unique profile URLs discovered: ${totalLeadsFound}`);

  // Fetch already scraped URLs if continueFromLast is enabled
  let alreadyScrapedUrls = new Set<string>();
  if (options?.continueFromLast !== false) {
    const existingLeads = await prisma.hireShopifyExpertLead.findMany({
      where: { userId },
      select: { profileUrl: true }
    });
    existingLeads.forEach(lead => {
      if (lead.profileUrl) {
        alreadyScrapedUrls.add(lead.profileUrl.toLowerCase().trim());
      }
    });
  }

  // Filter out already scraped profiles
  let candidateUrls = uniqueProfileUrls;
  if (options?.continueFromLast !== false) {
    candidateUrls = uniqueProfileUrls.filter(url => {
      const cleanUrl = url.toLowerCase().trim();
      return !alreadyScrapedUrls.has(cleanUrl);
    });
    console.log(`[Scraper] Filtered out ${uniqueProfileUrls.length - candidateUrls.length} already scraped profile URLs. Candidates left: ${candidateUrls.length}`);
  }

  // Apply batch limit (profiles per run: 40, 100, 200, etc.)
  const maxLeadsToScrape = options?.limit ?? 40;
  const leadsToProcess = candidateUrls.slice(0, maxLeadsToScrape);

  console.log(`[Scraper] Batch size to fetch in this run: ${leadsToProcess.length}`);

  // Phase 2: Scrape each profile page in the current batch
  for (const profileUrl of leadsToProcess) {
    try {
      console.log(`[Scraper] Fetching profile: ${profileUrl}`);
      const response = await axios.get(profileUrl, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 8000,
      });

      const parsedLead = parsePartnerProfileHtml(response.data, profileUrl);

      if (!validateLead(parsedLead)) {
        console.log(`[Scraper] Skipping invalid lead from: ${profileUrl}`);
        continue;
      }

      // Check database deduplication (double check in case of concurrent writes)
      const duplicate = await isDuplicateLead(
        userId,
        parsedLead.email,
        parsedLead.website,
        parsedLead.profileUrl
      );

      if (duplicate) {
        duplicatesSkipped++;
        console.log(`[Scraper] Duplicate skipped: ${parsedLead.name || parsedLead.website}`);
        continue;
      }

      // Save into DB
      await prisma.hireShopifyExpertLead.create({
        data: {
          userId,
          name: parsedLead.name,
          website: parsedLead.website,
          profileUrl: parsedLead.profileUrl,
          email: parsedLead.email,
          phone: parsedLead.phone,
          country: parsedLead.country,
          city: parsedLead.city,
          services: parsedLead.services,
          specialization: parsedLead.specialization,
          rating: parsedLead.rating,
          reviewsCount: parsedLead.reviewsCount,
          socialLinks: parsedLead.socialLinks || undefined,
          sourceUrl: parsedLead.sourceUrl,
          description: parsedLead.description,
          category: parsedLead.category,
          status: parsedLead.status,
          dateScraped: new Date(),
        },
      });

      newLeadsSaved++;
      console.log(`[Scraper] Saved lead: ${parsedLead.name}`);
    } catch (err: any) {
      console.error(`[Scraper] Failed to process profile ${profileUrl}:`, err.message);
      errors.push(`Failed to process profile ${profileUrl}: ${err.message}`);
    }
  }

  return {
    success: true,
    totalSourcesChecked,
    totalLeadsFound,
    newLeadsSaved,
    duplicatesSkipped,
    failedSources,
    errors: errors.slice(0, 20),
  };
}
