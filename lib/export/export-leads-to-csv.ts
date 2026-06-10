import Papa from "papaparse";
import type { Lead } from "@prisma/client";

export function exportLeadsToCsv(leads: Lead[]): string {
  const rows = leads.map((lead) => ({
    business_name: lead.businessName ?? "",
    website: lead.website ?? "",
    domain: lead.domain ?? "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    address: lead.address ?? "",
    city: lead.city ?? "",
    state: lead.state ?? "",
    zip_code: lead.zipCode ?? "",
    category: lead.category ?? "",
    primary_tech: lead.primaryTech ?? "",
    all_tech: Array.isArray(lead.allTech)
      ? (lead.allTech as string[]).join("; ")
      : "",
    confidence: lead.techConfidence ?? "",
    google_listing_url: lead.googleListingUrl ?? "",
    facebook: lead.facebook ?? "",
    instagram: lead.instagram ?? "",
    linkedin: lead.linkedin ?? "",
    twitter: lead.twitter ?? "",
    tiktok: lead.tiktok ?? "",
    youtube: lead.youtube ?? "",
    contact_page: lead.contactPage ?? "",
    about_page: lead.aboutPage ?? "",
    source: lead.source ?? "",
    created_at: lead.createdAt.toISOString(),
  }));

  return Papa.unparse(rows);
}
