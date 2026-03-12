import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/getContext";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const includePurchase = searchParams.get("includePurchase") === "true";

    const { organizationId } = await getTenantContext();
    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { lotNumber: { contains: search } },
        { product: { name: { contains: search } } },
      ];
    }

    const lots = await prisma.lot.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    const subLots = lots.map(lot => ({
      id: lot.id,
      subLotNo: lot.lotNumber,
      lotId: lot.id,
      lot: { ...lot, lotNo: lot.lotNumber, itemName: lot.product?.name },
      weight: lot.netWeight || 0,
      weightUnit: "G",
      pieces: lot.quantity,
      status: "IN_STOCK",
      createdAt: lot.createdAt.toISOString()
    }));

    let purchasesByLotId: Record<string, any> = {};
    if (includePurchase && lots.length > 0) {
      const lotIds = lots.map(l => l.id);
      const purchases = await prisma.purchase.findMany({
        where: { lotId: { in: lotIds }, organizationId },
        orderBy: { date: "desc" },
      });
      for (const p of purchases) {
        if (!purchasesByLotId[p.lotId]) {
          purchasesByLotId[p.lotId] = {
            ...p,
            netWeight: p.netWeight,
            pieces: p.pieces
          };
        }
      }
    }

    return NextResponse.json({ subLots, purchasesByLotId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Split a sublot - legacy unsupported
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Splitting is now handled at the Lot level" }, { status: 400 });
}

