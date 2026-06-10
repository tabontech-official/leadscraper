import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { leadsQuerySchema } from "@/lib/validations/api";
import { exportLeadsToCsv } from "@/lib/export/export-leads-to-csv";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const query = leadsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.LeadWhereInput = { userId: user.id };

    if (query.ids) {
      const ids = query.ids.split(",").filter(Boolean);
      where.id = { in: ids };
    } else {
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
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const csv = exportLeadsToCsv(leads);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
