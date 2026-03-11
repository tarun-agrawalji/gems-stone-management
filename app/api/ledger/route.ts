import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/getContext";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const refType = searchParams.get("transactionType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const { organizationId } = await getTenantContext();
    const where: any = { organizationId };

    if (productId) where.productId = productId;
    if (refType) where.transactionType = refType;

    const [entries, total] = await Promise.all([
      prisma.stockLedger.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockLedger.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

