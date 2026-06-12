import * as cheerio from "cheerio";

export function extractEmails(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches && matches.length > 0 ? matches[0] : null;
}

export function extractPhones(text: string): string | null {
  // Strip spaces, dashes, parens and match digits
  const cleaned = text.replace(/[\s\-\(\)\+]/g, "");
  if (/^\d{7,15}$/.test(cleaned)) {
    return text.trim();
  }
  return null;
}

export function extractRatingAndReviews(ratingText: string): { rating: number | null; reviewsCount: number | null } {
  // e.g. "Rating5.0(5054)" or "Rating 4.8 (120)"
  const match = ratingText.match(/Rating\s*([0-9.]+)\s*\(([^)]+)\)/i);
  if (match) {
    const rating = parseFloat(match[1]);
    const reviewsCount = parseInt(match[2].replace(/[^0-9]/g, ""), 10);
    return { rating: isNaN(rating) ? null : rating, reviewsCount: isNaN(reviewsCount) ? null : reviewsCount };
  }
  return { rating: null, reviewsCount: null };
}

export function extractSocialLinks($: cheerio.CheerioAPI): any {
  const socialLinks: any = {};
  
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    
    const url = href.toLowerCase();
    // Exclude shopify's official accounts
    if (url.includes("shopify")) return;

    if (url.includes("facebook.com/")) {
      socialLinks.facebook = href;
    } else if (url.includes("twitter.com/") || url.includes("x.com/")) {
      socialLinks.twitter = href;
    } else if (url.includes("linkedin.com/in/") || url.includes("linkedin.com/company/")) {
      socialLinks.linkedin = href;
    } else if (url.includes("instagram.com/")) {
      socialLinks.instagram = href;
    } else if (url.includes("youtube.com/")) {
      socialLinks.youtube = href;
    } else if (url.includes("tiktok.com/")) {
      socialLinks.tiktok = href;
    }
  });

  return Object.keys(socialLinks).length > 0 ? socialLinks : null;
}

export interface RawLeadData {
  name: string | null;
  website: string | null;
  profileUrl: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  services: string | null;
  specialization: string | null;
  rating: number | null;
  reviewsCount: number | null;
  socialLinks: any;
  sourceUrl: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
}

export function parsePartnerProfileHtml(html: string, profileUrl: string): RawLeadData {
  const $ = cheerio.load(html);

  // Business Name: H1 is usually the partner name
  const name = $("h1").first().text().trim() || null;

  // Bio / Description: pre tag under H2 About
  let description: string | null = null;
  const aboutHeader = $("h2").filter((_, el) => $(el).text().trim().toLowerCase() === "about");
  if (aboutHeader.length > 0) {
    const descPre = aboutHeader.nextAll("pre").first();
    if (descPre.length > 0) {
      description = descPre.text().trim();
    }
  }

  // Contact section elements
  let website: string | null = null;
  let email: string | null = null;
  let phone: string | null = null;

  // Standard mailto: link check
  const mailtoLink = $('a[href^="mailto:"]');
  if (mailtoLink.length > 0) {
    email = mailtoLink.attr("href")!.replace("mailto:", "").split("?")[0].trim() || null;
  }

  // Standard tel: link check
  const telLink = $('a[href^="tel:"]');
  if (telLink.length > 0) {
    phone = telLink.attr("href")!.replace("tel:", "").trim() || null;
  }

  // Search contact information sibling block
  const contactInfoLabel = $("p").filter((_, el) => $(el).text().trim().includes("Contact information"));
  if (contactInfoLabel.length > 0) {
    // Loop through siblings to extract text
    let sibling = contactInfoLabel.next();
    while (sibling.length && !sibling.text().includes("Primary location") && !sibling.text().includes("Supported locations")) {
      const text = sibling.text().trim();
      
      // Try to match email if not matched yet
      if (!email && text.includes("@")) {
        const parsedEmail = extractEmails(text);
        if (parsedEmail) email = parsedEmail;
      }
      
      // Try to match phone if not matched yet
      if (!phone && /^[+0-9\s\-()]{7,25}$/.test(text.replace(/\s/g, ""))) {
        phone = text;
      }

      // Check if it's website
      if (!website) {
        const link = sibling.find("a").first();
        const href = sibling.attr("href") || link.attr("href");
        if (href && !href.includes("shopify.com") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          website = href;
        } else if (text && text.includes(".") && !text.includes(" ") && !text.includes("@")) {
          // Plain text domain e.g. "itgeeks.com"
          website = text.startsWith("http") ? text : `https://${text}`;
        }
      }

      sibling = sibling.next();
    }
  }

  // Fallback for Website URL: search all links
  if (!website) {
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && (href.startsWith("http://") || href.startsWith("https://")) && !href.includes("shopify.com")) {
        website = href;
        return false; // Break loop
      }
    });
  }

  // Fallback for Email: regex search in page text
  if (!email) {
    email = extractEmails($.text());
  }

  // Primary Location parsing
  let city: string | null = null;
  let country: string | null = null;
  const locationLabel = $("p").filter((_, el) => $(el).text().trim() === "Primary location");
  if (locationLabel.length > 0) {
    const locationText = locationLabel.next().text().trim();
    if (locationText) {
      const parts = locationText.split(",");
      if (parts.length > 1) {
        city = parts[0].trim() || null;
        country = parts[1].trim() || null;
      } else {
        country = parts[0].trim() || null;
      }
    }
  }

  // Rating and reviews count from H2 text
  let rating: number | null = null;
  let reviewsCount: number | null = null;
  const ratingHeader = $("h2").filter((_, el) => $(el).text().trim().toLowerCase().startsWith("rating"));
  if (ratingHeader.length > 0) {
    const res = extractRatingAndReviews(ratingHeader.text().trim());
    rating = res.rating;
    reviewsCount = res.reviewsCount;
  }

  // Fallback rating if H2 format changed (scan paragraph numbers)
  if (rating === null) {
    const rateText = $("p").filter((_, el) => /^[1-5]\.[0-9]$/.test($(el).text().trim())).first().text().trim();
    if (rateText) {
      rating = parseFloat(rateText);
    }
  }

  // Services
  let services: string | null = null;
  const otherServicesLabel = $("h2").filter((_, el) => $(el).text().trim().toLowerCase() === "other services");
  if (otherServicesLabel.length > 0) {
    services = otherServicesLabel.next("p").text().trim() || null;
  } else {
    const specializedServices: string[] = [];
    $("h2").filter((_, el) => $(el).text().trim().toLowerCase() === "specialized services").nextAll("div").each((_, el) => {
      const title = $(el).find("h3, h4").first().text().trim();
      if (title) specializedServices.push(title);
    });
    if (specializedServices.length > 0) {
      services = specializedServices.join(", ");
    }
  }

  // Specialization (Industries)
  let specialization: string | null = null;
  const industriesLabel = $("h2").filter((_, el) => $(el).text().trim().toLowerCase() === "industries");
  if (industriesLabel.length > 0) {
    specialization = industriesLabel.next("p").text().trim() || null;
  }

  // Social links
  const socialLinks = extractSocialLinks($);

  return {
    name,
    website,
    profileUrl,
    email,
    phone,
    country,
    city,
    services,
    specialization,
    rating,
    reviewsCount,
    socialLinks,
    sourceUrl: profileUrl,
    description,
    category: "Shopify Experts",
    status: "active"
  };
}

export function validateLead(lead: RawLeadData): boolean {
  // Required: At least one identifier (name, website, profileUrl) is present
  return !!((lead.name && lead.name.trim() !== "") || 
            (lead.website && lead.website.trim() !== "") || 
            (lead.profileUrl && lead.profileUrl.trim() !== ""));
}
