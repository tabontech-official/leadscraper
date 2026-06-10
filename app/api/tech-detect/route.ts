import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { techDetectSchema } from "@/lib/validations/api";
import { enqueueTechDetection } from "@/lib/jobs/queue";

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const parsed = techDetectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const leads = await prisma.lead.findMany({
      where: {
        id: { in: parsed.data.leadIds },
        userId: user.id,
      },
    });

    for (const lead of leads) {
      await enqueueTechDetection(lead.id);
    }

    return NextResponse.json({ success: true, queued: leads.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Tech detection failed" }, { status: 500 });
  }
}
