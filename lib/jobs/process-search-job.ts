import { prisma } from "@/lib/db";
import type { CsvRow } from "@/lib/csv/parse";
import { searchBusinesses, type ProviderName } from "@/lib/search-providers";
import { extractBusinessDetails } from "@/lib/crawler/extract-business-details";
import { detectTechFromHtml, detectTechStack } from "@/lib/tech-detection/detect";
import { normalizeDomain, normalizeWebsiteUrl } from "@/lib/utils/domain";
import { getPlanLimits } from "@/lib/plans/limits";
import { enqueueTechDetection } from "./queue";
import axios from "axios";
import { assertSafeUrl } from "@/lib/crawler/ssrf";

export async function processSearchJob(jobId: string) {
  const job = await prisma.searchJob.findUnique({
    where: { id: jobId },
    include: { user: true },
  });

  if (!job) return;

  const rows = (job.csvData as CsvRow[] | null) ?? [];
  const provider = job.searchProvider as ProviderName;
  const limits = getPlanLimits(job.user.plan);

  await prisma.searchJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", processedRows: 0, errorMessage: null },
  });

  try {
    let leadsFound = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const results = await searchBusinesses(provider, {
        zipCode: row.zip_code,
        category: row.category,
        state: row.state,
        limit: Math.min(job.resultsPerRow, limits.maxResultsPerRow),
      });

      for (const result of results) {
        const website = normalizeWebsiteUrl(result.website);
        const domain =
          normalizeDomain(website ?? result.website) ??
          normalizeDomain(result.businessName);

        if (!domain) continue;

        const leadCount = await prisma.lead.count({
          where: { userId: job.userId },
        });
        if (leadCount >= limits.maxLeads) break;

        let email: string | null = null;
        let phone = result.phone ?? null;
        let crawlData: Awaited<ReturnType<typeof extractBusinessDetails>> | null =
          null;
        let tech = {
          primaryTech: null as string | null,
          allTech: [] as string[],
          confidence: 0,
          signals: [] as string[],
        };

        if (website && job.runTechImmediately) {
          try {
            crawlData = await extractBusinessDetails(website);
            email = crawlData.emails[0] ?? null;
            phone = phone ?? crawlData.phones[0] ?? null;
            const html = await fetchHtml(website);
            tech = html ? detectTechFromHtml(html) : await detectTechStack(website);
          } catch {
            // continue with search data only
          }
        }

        await prisma.lead.upsert({
          where: {
            userId_domain: { userId: job.userId, domain },
          },
          create: {
            userId: job.userId,
            jobId: job.id,
            businessName:
              result.businessName ?? crawlData?.title ?? null,
            website,
            domain,
            phone,
            email,
            address: result.address ?? null,
            city: result.city ?? null,
            state: result.state ?? row.state,
            zipCode: result.zipCode ?? row.zip_code,
            category: result.category ?? row.category,
            googleListingUrl: result.googleListingUrl ?? null,
            source: result.source,
            facebook: crawlData?.facebook ?? null,
            instagram: crawlData?.instagram ?? null,
            linkedin: crawlData?.linkedin ?? null,
            twitter: crawlData?.twitter ?? null,
            tiktok: crawlData?.tiktok ?? null,
            youtube: crawlData?.youtube ?? null,
            contactPage: crawlData?.contactPage ?? null,
            aboutPage: crawlData?.aboutPage ?? null,
            primaryTech: tech.primaryTech,
            allTech: tech.allTech,
            techConfidence: tech.confidence,
            techSignals: tech.signals,
            rawData: result.rawData as object,
          },
          update: {
            jobId: job.id,
            businessName: result.businessName ?? undefined,
            website: website ?? undefined,
            phone: phone ?? undefined,
            email: email ?? undefined,
            googleListingUrl: result.googleListingUrl ?? undefined,
            primaryTech: tech.primaryTech ?? undefined,
            allTech: tech.allTech,
            techConfidence: tech.confidence,
            techSignals: tech.signals,
          },
        });

        leadsFound++;

        if (website && !job.runTechImmediately) {
          const saved = await prisma.lead.findUnique({
            where: { userId_domain: { userId: job.userId, domain } },
          });
          if (saved) await enqueueTechDetection(saved.id);
        }
      }

      await prisma.searchJob.update({
        where: { id: jobId },
        data: {
          processedRows: i + 1,
          totalLeadsFound: leadsFound,
        },
      });

      await delay(500);
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", totalLeadsFound: leadsFound },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error processing job";
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "FAILED", errorMessage: message },
    });
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const safe = await assertSafeUrl(url);
    const res = await axios.get(safe.toString(), {
      timeout: 10000,
      headers: { Accept: "text/html" },
    });
    return typeof res.data === "string" ? res.data : null;
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function createSearchJob(params: {
  userId: string;
  name?: string;
  rows: CsvRow[];
  resultsPerRow: number;
  searchProvider: ProviderName;
  runTechImmediately: boolean;
}) {
  const job = await prisma.searchJob.create({
    data: {
      userId: params.userId,
      name: params.name ?? `Search ${new Date().toLocaleDateString()}`,
      csvData: params.rows as unknown as object,
      totalRows: params.rows.length,
      resultsPerRow: params.resultsPerRow,
      searchProvider: params.searchProvider,
      runTechImmediately: params.runTechImmediately,
      status: "PENDING",
    },
  });

  return job;
}
