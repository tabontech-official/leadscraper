import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { runShopifyExpertsScraper } from "@/lib/hire-shopify-experts/scraper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customUrls: string[] | undefined = undefined;
    let limit: number | undefined = undefined;
    let continueFromLast: boolean | undefined = undefined;
    let selectedSources: string[] | undefined = undefined;

    try {
      const body = await req.json();
      if (body) {
        if (Array.isArray(body.urls)) {
          customUrls = body.urls.filter((url: any) => typeof url === "string" && url.trim() !== "");
        }
        if (typeof body.limit === "number") {
          limit = body.limit;
        }
        if (typeof body.continueFromLast === "boolean") {
          continueFromLast = body.continueFromLast;
        }
        if (Array.isArray(body.selectedSources)) {
          selectedSources = body.selectedSources.filter((s: any) => typeof s === "string");
        }
      }
    } catch (e) {
      // Body might be empty or not JSON, ignore and use defaults
    }

    console.log(`[Scrape Route] Initiating scraper for user: ${user.id}, limit: ${limit}, continueFromLast: ${continueFromLast}`);
    const result = await runShopifyExpertsScraper(user.id, customUrls, {
      limit,
      continueFromLast,
      selectedSources,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error running shopify experts scraping job:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
