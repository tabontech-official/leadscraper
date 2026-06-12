import { prisma } from "@/lib/db";

export async function isDuplicateLead(
  userId: string,
  email: string | null,
  website: string | null,
  profileUrl: string | null
): Promise<boolean> {
  const conditions: any[] = [];
  
  if (email && email.trim() !== "") {
    conditions.push({ email });
  }
  if (website && website.trim() !== "") {
    conditions.push({ website });
    // Try matching without trailing slashes or protocols if needed, but exact matches are primary
    const cleanWeb = website.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
    if (cleanWeb) {
      conditions.push({ website: { contains: cleanWeb } });
    }
  }
  if (profileUrl && profileUrl.trim() !== "") {
    conditions.push({ profileUrl });
    const cleanProfile = profileUrl.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
    if (cleanProfile) {
      conditions.push({ profileUrl: { contains: cleanProfile } });
    }
  }

  if (conditions.length === 0) return false;

  const existing = await prisma.hireShopifyExpertLead.findFirst({
    where: {
      userId,
      OR: conditions,
    },
  });

  return !!existing;
}
