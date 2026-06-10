import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { startJobSchema } from "@/lib/validations/api";
import { createSearchJob } from "@/lib/jobs/process-search-job";
import { enqueueSearchJob } from "@/lib/jobs/queue";
import { getPlanLimits, getCurrentMonthKey } from "@/lib/plans/limits";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const parsed = startJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const limits = getPlanLimits(user.plan);
    const { rows, resultsPerRow, searchProvider, runTechImmediately, name } =
      parsed.data;

    if (rows.length > limits.maxRowsPerCsv) {
      return NextResponse.json({ error: "Row limit exceeded" }, { status: 403 });
    }

    if (resultsPerRow > limits.maxResultsPerRow) {
      return NextResponse.json(
        { error: `Max ${limits.maxResultsPerRow} results per row on your plan` },
        { status: 403 }
      );
    }

    if (searchProvider === "serpapi" && !process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { error: "SERPAPI_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    if (searchProvider === "google_places" && !process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_PLACES_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const monthKey = getCurrentMonthKey();
    let uploadsThisMonth = user.uploadsThisMonth;
    if (user.uploadsMonthKey !== monthKey) uploadsThisMonth = 0;

    if (uploadsThisMonth >= limits.uploadsPerMonth) {
      return NextResponse.json({ error: "Monthly upload limit reached" }, { status: 403 });
    }

    const job = await createSearchJob({
      userId: user.id,
      name,
      rows,
      resultsPerRow,
      searchProvider,
      runTechImmediately,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        uploadsThisMonth: uploadsThisMonth + 1,
        uploadsMonthKey: monthKey,
      },
    });

    await enqueueSearchJob(job.id);

    return NextResponse.json({ success: true, job });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to start job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
