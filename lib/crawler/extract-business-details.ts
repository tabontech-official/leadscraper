import axios from "axios";
import * as cheerio from "cheerio";
import { assertSafeUrl } from "./ssrf";
import { normalizeWebsiteUrl } from "@/lib/utils/domain";

const EXTRA_PATHS = ["/contact", "/contact-us", "/about", "/about-us"];
const MAX_EXTRA_PAGES = 3;
const TIMEOUT_MS = 10000;

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  facebook: /facebook\.com/i,
  instagram: /instagram\.com/i,
  linkedin: /linkedin\.com/i,
  twitter: /(twitter\.com|x\.com)/i,
  tiktok: /tiktok\.com/i,
  youtube: /youtube\.com/i,
};

export interface ExtractedBusinessDetails {
  title?: string;
  metaDescription?: string;
  emails: string[];
  phones: string[];
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  contactPage?: string;
  aboutPage?: string;
}

export async function extractBusinessDetails(
  rawUrl: string
): Promise<ExtractedBusinessDetails> {
  const normalized = normalizeWebsiteUrl(rawUrl);
  if (!normalized) {
    throw new Error("INVALID_WEBSITE_URL");
  }

  const baseUrl = await assertSafeUrl(normalized);
  const origin = baseUrl.origin;

  const aggregated: ExtractedBusinessDetails = {
    emails: [],
    phones: [],
  };

  const homepageHtml = await fetchPage(baseUrl.toString());
  if (!homepageHtml) return aggregated;

  mergeExtraction(aggregated, extractFromHtml(homepageHtml, origin));

  if (aggregated.emails.length === 0) {
    let extraCount = 0;
    for (const path of EXTRA_PATHS) {
      if (extraCount >= MAX_EXTRA_PAGES) break;
      const pageUrl = `${origin}${path}`;
      try {
        await assertSafeUrl(pageUrl);
        const html = await fetchPage(pageUrl);
        if (html) {
          mergeExtraction(aggregated, extractFromHtml(html, origin));
          extraCount++;
          if (aggregated.emails.length > 0) break;
        }
      } catch {
        // skip blocked or invalid paths
      }
    }
  }

  aggregated.emails = Array.from(new Set(aggregated.emails)).slice(0, 5);
  aggregated.phones = Array.from(new Set(aggregated.phones)).slice(0, 5);

  return aggregated;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const safeUrl = await assertSafeUrl(url);
    const res = await axios.get(safeUrl.toString(), {
      timeout: TIMEOUT_MS,
      maxRedirects: 3,
      headers: {
        "User-Agent":
          "LeadStackFinder/1.0 (+https://leadstackfinder.com; business enrichment)",
        Accept: "text/html",
      },
      validateStatus: (s) => s >= 200 && s < 400,
    });
    return typeof res.data === "string" ? res.data : null;
  } catch {
    return null;
  }
}

function extractFromHtml(html: string, origin: string): ExtractedBusinessDetails {
  const $ = cheerio.load(html);
  const result: ExtractedBusinessDetails = {
    emails: [],
    phones: [],
  };

  result.title = $("title").first().text().trim() || undefined;
  result.metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim();

  const text = $.text();
  const mailtoEmails = $("a[href^='mailto:']")
    .map((_, el) => $(el).attr("href")?.replace(/^mailto:/i, "").split("?")[0])
    .get()
    .filter(Boolean) as string[];

  result.emails = [
    ...mailtoEmails,
    ...(text.match(EMAIL_REGEX) ?? []),
  ].map((e) => e.toLowerCase());

  result.phones = text.match(PHONE_REGEX) ?? [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const absolute = toAbsoluteUrl(href, origin);
    if (!absolute) return;

    if (SOCIAL_PATTERNS.facebook.test(absolute)) result.facebook = absolute;
    if (SOCIAL_PATTERNS.instagram.test(absolute)) result.instagram = absolute;
    if (SOCIAL_PATTERNS.linkedin.test(absolute)) result.linkedin = absolute;
    if (SOCIAL_PATTERNS.twitter.test(absolute)) result.twitter = absolute;
    if (SOCIAL_PATTERNS.tiktok.test(absolute)) result.tiktok = absolute;
    if (SOCIAL_PATTERNS.youtube.test(absolute)) result.youtube = absolute;

    const lower = href.toLowerCase();
    if (!result.contactPage && /contact/.test(lower)) {
      result.contactPage = absolute;
    }
    if (!result.aboutPage && /about/.test(lower)) {
      result.aboutPage = absolute;
    }
  });

  return result;
}

function toAbsoluteUrl(href: string, origin: string): string | null {
  try {
    if (href.startsWith("http")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    if (href.startsWith("/")) return `${origin}${href}`;
    return new URL(href, origin).toString();
  } catch {
    return null;
  }
}

function mergeExtraction(
  target: ExtractedBusinessDetails,
  source: ExtractedBusinessDetails
) {
  target.emails.push(...source.emails);
  target.phones.push(...source.phones);
  if (!target.title && source.title) target.title = source.title;
  if (!target.metaDescription && source.metaDescription)
    target.metaDescription = source.metaDescription;
  if (!target.facebook && source.facebook) target.facebook = source.facebook;
  if (!target.instagram && source.instagram)
    target.instagram = source.instagram;
  if (!target.linkedin && source.linkedin) target.linkedin = source.linkedin;
  if (!target.twitter && source.twitter) target.twitter = source.twitter;
  if (!target.tiktok && source.tiktok) target.tiktok = source.tiktok;
  if (!target.youtube && source.youtube) target.youtube = source.youtube;
  if (!target.contactPage && source.contactPage)
    target.contactPage = source.contactPage;
  if (!target.aboutPage && source.aboutPage) target.aboutPage = source.aboutPage;
}
