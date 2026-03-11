import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/getContext";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    const { organizationId } = await getTenantContext();

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { lotNumber: { contains: search } },
        { product: { name: { contains: search } } },
        { product: { category: { contains: search } } },
      ];
    }

    const [lots, total] = await Promise.all([
      prisma.lot.findMany({
        where,
        include: {
          product: true,
          manufacturing: {
            orderBy: { date: "desc" },
            take: 1,
          },
          sales: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lot.count({ where }),
    ]);

    // Note: To properly calculate statuses, we'd look at remaining quantities
    // For now, map the lot structure to what the frontend expects as "subLots"
    const finishedLots = lots.map(lot => ({
      ...lot,
      lot: {
        lotNo: lot.lotNumber,
        itemName: lot.product?.name,
        category: lot.product?.category
      },
      subLotNo: lot.lotNumber, // mock
      status: "READY",
      weightUnit: "G",
      pieces: lot.quantity
    }));

    return NextResponse.json({
      subLots: finishedLots,
      total,
      page,
      limit,
      summary: {
        readyCount: total,
        partiallySoldCount: 0,
        inStockCount: 0,
        totalAvailable: total,
        totalWeight: lots.reduce((acc, lot) => acc + (lot.grossWeight || 0), 0)
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch finished goods" }, { status: 500 });
  }
}

