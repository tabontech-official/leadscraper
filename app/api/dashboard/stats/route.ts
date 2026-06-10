import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuthUser();

    const [
      totalLeads,
      shopifySites,
      wordpressSites,
      wooCommerceSites,
      leadsWithEmail,
      leadsWithPhone,
      completedJobs,
      runningJobs,
    ] = await Promise.all([
      prisma.lead.count({ where: { userId: user.id } }),
      prisma.lead.count({
        where: { userId: user.id, primaryTech: "Shopify" },
      }),
      prisma.lead.count({
        where: { userId: user.id, primaryTech: "WordPress" },
      }),
      prisma.lead.count({
        where: { userId: user.id, primaryTech: "WooCommerce" },
      }),
      prisma.lead.count({
        where: { userId: user.id, email: { not: null } },
      }),
      prisma.lead.count({
        where: { userId: user.id, phone: { not: null } },
      }),
      prisma.searchJob.count({
        where: { userId: user.id, status: "COMPLETED" },
      }),
      prisma.searchJob.count({
        where: { userId: user.id, status: "RUNNING" },
      }),
    ]);

    return NextResponse.json({
      totalLeads,
      shopifySites,
      wordpressSites,
      wooCommerceSites,
      leadsWithEmail,
      leadsWithPhone,
      completedJobs,
      runningJobs,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
