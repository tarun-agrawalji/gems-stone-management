import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/getContext";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await getTenantContext();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause — query Purchase table directly so we always
    // show what was actually purchased.
    const purchaseWhere: any = { organizationId };

    if (search) {
      purchaseWhere.OR = [
        { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
        { itemName: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
      ];
    }

    // category filter: check the lot's category field
    if (category) {
      purchaseWhere.lot = { ...purchaseWhere.lot, category };
    }

    const purchases = await (prisma as any).purchase.findMany({
      where: purchaseWhere,
      include: {
        lot: {
          include: {
            product: true,
            manufacturing: { orderBy: { date: "desc" }, take: 1 },
            sales: { orderBy: { date: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await (prisma as any).purchase.count({ where: purchaseWhere });

    // Map Purchase → the shape the frontend (SubLot type) expects
    const finishedGoods = purchases
      .filter((p: any) => {
        // Apply status filter against the lot status
        if (status) return (p.lot?.status || "IN_STOCK") === status;
        return true;
      })
      .map((p: any) => {
        const lot = p.lot;
        const netWt = (p.grossWeight || 0) - (p.lessWeight || 0);
        const rejWt = p.rejectionWeight || 0;
        // Selection weight = net - rejection
        const selectionWeight = Math.max(0, netWt - rejWt);

        return {
          id: p.id,
          subLotNo: lot?.lotNumber || "—",
          lotId: lot?.id || "",
          status: lot?.status || "IN_STOCK",
          weight: selectionWeight,        // show Selection weight as "available" weight
          weightUnit: p.weightUnit || "G",
          pieces: p.rejectionPieces != null && p.pieces != null
            ? Math.max(0, p.pieces - p.rejectionPieces)
            : (p.pieces ?? null),
          shape: p.shape,
          size: p.size,
          lines: p.lines,
          length: p.lineLength,
          updatedAt: p.date,
          lot: {
            lotNumber: lot?.lotNumber || "—",
            itemName: p.itemName || lot?.itemName || lot?.product?.name || null,
            category: lot?.category || lot?.product?.category || "",
            supplierName: p.supplier || lot?.supplierName || null,
            grossWeight: p.grossWeight ?? 0,
            netWeight: netWt,
          },
          manufacturing: lot?.manufacturing || [],
          sales: lot?.sales || [],
          // Extra purchase context
          purchasePrice: p.purchasePrice,
          totalCost: p.totalCost,
          purchaseDate: p.date,
          rejectionWeight: p.rejectionWeight,
          rejectionPieces: p.rejectionPieces,
          rejectionStatus: p.rejectionStatus,
        };
      });

    return NextResponse.json({
      subLots: finishedGoods,
      total,
      page,
      limit,
      summary: {
        readyCount: finishedGoods.filter((g: any) => g.status === "READY").length,
        partiallySoldCount: finishedGoods.filter((g: any) => g.status === "PARTIALLY_SOLD").length,
        inStockCount: finishedGoods.filter((g: any) => g.status === "IN_STOCK").length,
        totalAvailable: finishedGoods.length,
        totalWeight: finishedGoods.reduce((acc: number, g: any) => acc + (g.weight || 0), 0),
      },
    });
  } catch (e: any) {
    console.error("[finished-goods] ERROR:", e);
    const errorMessage = e?.message || String(e) || "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
