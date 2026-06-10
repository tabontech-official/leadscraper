import { prisma } from "@/lib/db";
import { extractBusinessDetails } from "@/lib/crawler/extract-business-details";
import { detectTechStack } from "@/lib/tech-detection/detect";
import { normalizeDomain, normalizeWebsiteUrl } from "@/lib/utils/domain";

export async function processTechDetection(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead?.website) return;

  const website = normalizeWebsiteUrl(lead.website);
  if (!website) return;

  try {
    const details = await extractBusinessDetails(website);
    const tech = await detectTechStack(website);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        email: lead.email ?? details.emails[0] ?? null,
        phone: lead.phone ?? details.phones[0] ?? null,
        facebook: lead.facebook ?? details.facebook ?? null,
        instagram: lead.instagram ?? details.instagram ?? null,
        linkedin: lead.linkedin ?? details.linkedin ?? null,
        twitter: lead.twitter ?? details.twitter ?? null,
        tiktok: lead.tiktok ?? details.tiktok ?? null,
        youtube: lead.youtube ?? details.youtube ?? null,
        contactPage: lead.contactPage ?? details.contactPage ?? null,
        aboutPage: lead.aboutPage ?? details.aboutPage ?? null,
        businessName: lead.businessName ?? details.title ?? null,
        domain: lead.domain ?? normalizeDomain(website),
        primaryTech: tech.primaryTech,
        allTech: tech.allTech,
        techConfidence: tech.confidence,
        techSignals: tech.signals,
      },
    });
  } catch {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        techSignals: ["Tech detection failed"],
      },
    });
  }
}
