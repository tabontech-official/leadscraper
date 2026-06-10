import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { leadsQuerySchema } from "@/lib/validations/api";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const query = leadsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.LeadWhereInput = { userId: user.id };

    if (query.search) {
      where.businessName = { contains: query.search, mode: "insensitive" };
    }
    if (query.domain) {
      where.domain = { contains: query.domain, mode: "insensitive" };
    }
    if (query.state) where.state = query.state;
    if (query.category) where.category = query.category;
    if (query.zipCode) where.zipCode = query.zipCode;
    if (query.primaryTech) where.primaryTech = query.primaryTech;
    if (query.hasEmail) where.email = { not: null };
    if (query.hasPhone) where.phone = { not: null };
    if (query.hasWebsite) where.website = { not: null };
    if (query.confidenceMin) {
      where.techConfidence = { gte: query.confidenceMin };
    }
    if (query.jobId) where.jobId = query.jobId;

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    const sortField = query.sortBy ?? "createdAt";
    const sortDir = query.sortDir ?? "desc";
    if (
      [
        "businessName",
        "domain",
        "primaryTech",
        "techConfidence",
        "createdAt",
        "state",
        "category",
      ].includes(sortField)
    ) {
      (orderBy as Record<string, string>)[sortField] = sortDir;
    } else {
      orderBy.createdAt = "desc";
    }

    const skip = (query.page - 1) * query.pageSize;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
