import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { parseCsv, validateCsvRows } from "@/lib/csv/parse";
import { getPlanLimits, getCurrentMonthKey } from "@/lib/plans/limits";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const limits = getPlanLimits(user.plan);
    const monthKey = getCurrentMonthKey();

    let uploadsThisMonth = user.uploadsThisMonth;
    if (user.uploadsMonthKey !== monthKey) {
      uploadsThisMonth = 0;
      await prisma.user.update({
        where: { id: user.id },
        data: { uploadsMonthKey: monthKey, uploadsThisMonth: 0 },
      });
    }

    if (uploadsThisMonth >= limits.uploadsPerMonth) {
      return NextResponse.json(
        { error: `Monthly upload limit reached (${limits.uploadsPerMonth})` },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const content = await file.text();
    const parsed = parseCsv(content);
    const validation = validateCsvRows(parsed);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    if (validation.rows.length > limits.maxRowsPerCsv) {
      return NextResponse.json(
        {
          error: `CSV exceeds row limit (${limits.maxRowsPerCsv} for ${user.plan} plan)`,
        },
        { status: 400 }
      );
    }

    const preview = validation.rows.slice(0, 10);

    return NextResponse.json({
      success: true,
      totalRows: validation.rows.length,
      preview,
      rows: validation.rows,
      limits: {
        maxResultsPerRow: limits.maxResultsPerRow,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
