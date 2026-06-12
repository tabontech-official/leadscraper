import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = req.nextUrl;
    const search = url.searchParams.get("search") ?? "";
    const country = url.searchParams.get("country") ?? "";
    const service = url.searchParams.get("service") ?? "";
    const rating = url.searchParams.get("rating") ?? "";
    const source = url.searchParams.get("source") ?? "";
    const dateFrom = url.searchParams.get("dateFrom") ?? "";
    const dateTo = url.searchParams.get("dateTo") ?? "";

    const where: any = { userId: user.id };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { website: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (service) where.services = { contains: service, mode: "insensitive" };
    if (rating) where.rating = { gte: parseFloat(rating) };
    if (source) where.sourceUrl = { contains: source, mode: "insensitive" };
    if (dateFrom || dateTo) {
      where.dateScraped = {};
      if (dateFrom) where.dateScraped.gte = new Date(dateFrom);
      if (dateTo) where.dateScraped.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const leads = await prisma.hireShopifyExpertLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const rows = leads.map((lead) => ({
      name: lead.name ?? "",
      website: lead.website ?? "",
      profile_url: lead.profileUrl ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      country: lead.country ?? "",
      city: lead.city ?? "",
      services: lead.services ?? "",
      specialization: lead.specialization ?? "",
      rating: lead.rating ?? "",
      reviews_count: lead.reviewsCount ?? "",
      social_links: lead.socialLinks ? JSON.stringify(lead.socialLinks) : "",
      source_url: lead.sourceUrl ?? "",
      description: lead.description ?? "",
      category: lead.category ?? "",
      status: lead.status ?? "",
      date_scraped: lead.dateScraped?.toISOString() ?? "",
      created_at: lead.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hire-shopify-experts-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
