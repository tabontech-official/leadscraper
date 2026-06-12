import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hireShopifyExpertLeadSchema } from "@/lib/validations/hire-shopify-expert";

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
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "25", 10);
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

    const where: any = { userId: user.id };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { website: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (country) {
      where.country = { contains: country, mode: "insensitive" };
    }
    if (service) {
      where.services = { contains: service, mode: "insensitive" };
    }
    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }
    if (source) {
      where.sourceUrl = { contains: source, mode: "insensitive" };
    }
    if (dateFrom || dateTo) {
      where.dateScraped = {};
      if (dateFrom) where.dateScraped.gte = new Date(dateFrom);
      if (dateTo) where.dateScraped.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const [leads, total] = await Promise.all([
      prisma.hireShopifyExpertLead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.hireShopifyExpertLead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching hire shopify expert leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const parsed = hireShopifyExpertLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lead = await prisma.hireShopifyExpertLead.create({
      data: {
        userId: user.id,
        ...parsed.data,
        socialLinks: parsed.data.socialLinks ?? undefined,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating hire shopify expert lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
