import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hireShopifyExpertImportRowSchema } from "@/lib/validations/hire-shopify-expert";

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
    const { rows } = body;

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { error: "'rows' must be an array" },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = hireShopifyExpertImportRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errorCount++;
        errors.push({
          row: i + 1,
          message: parsed.error.errors.map((e) => e.message).join(", "),
        });
        continue;
      }

      try {
        await prisma.hireShopifyExpertLead.create({
          data: {
            userId: user.id,
            ...parsed.data,
            socialLinks: parsed.data.socialLinks ?? undefined,
          },
        });
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push({
          row: i + 1,
          message: "Database insert failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      failed: errorCount,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error("Error importing leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
