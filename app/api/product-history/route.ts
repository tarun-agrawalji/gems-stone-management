import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/auth/getContext";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const { organizationId } = await getTenantContext();
    const orgWhere = { organizationId };

    if (!search) {
      const allLots = await prisma.lot.findMany({
        where: orgWhere,
        include: {
          product: true,
          purchases: true,
          manufacturing: true,
          sales: true,
        },
        orderBy: { createdAt: "desc" }
      });

      const lotsWithMetrics = allLots.map(lot => {
        let totalPurchaseCost = 0;
        lot.purchases.forEach(p => totalPurchaseCost += (p.purchasePrice));

        let totalRevenue = 0;
        lot.sales.forEach(s => totalRevenue += (s.netSale));

        let totalManufacturingCost = 0; // Not tracked in new schema directly

        const netProfit = totalRevenue - (totalPurchaseCost + totalManufacturingCost);
        return {
          id: lot.id,
          lotNo: lot.lotNumber,
          itemName: lot.product?.name,
          category: lot.product?.category,
          totalProductCost: totalPurchaseCost + totalManufacturingCost,
          totalRevenue,
          netProfit,
          currentAvailableWeight: lot.quantity,
          date: lot.createdAt
        };
      });

      return NextResponse.json({ type: "all", lots: lotsWithMetrics });
    }

    // Search by Lot Number
    let lot = await prisma.lot.findFirst({
      where: { 
        lotNumber: { equals: search },
        organizationId
      },
      include: {
        product: true,
        purchases: { orderBy: { date: "asc" } },
        manufacturing: { orderBy: { date: "asc" } },
        sales: { orderBy: { date: "asc" } },
      },
    });

    if (!lot) {
      return NextResponse.json({ error: "No product history found for this Lot Number" }, { status: 404 });
    }

    // ── Metrics Calculation ── //

    let totalPurchaseCost = 0;
    let initialWeightGross = lot.quantity; // mock
    let initialWeightNet = lot.quantity; // mock

    lot.purchases.forEach(p => {
      totalPurchaseCost += (p.purchasePrice);
    });

    let totalManufacturingCost = 0;
    let totalRevenue = 0;
    let totalDiscount = 0;
    let currentAvailableWeight = lot.quantity;

    lot.sales.forEach(s => {
      totalRevenue += (s.netSale);
    });

    const netProfit = totalRevenue - (totalPurchaseCost + totalManufacturingCost);

    const metrics = {
      totalPurchaseCost,
      initialWeightGross,
      initialWeightNet,
      totalManufacturingCost,
      totalProductCost: totalPurchaseCost + totalManufacturingCost,
      totalRevenue,
      totalDiscount,
      netProfit,
      currentAvailableWeight,
    };

    // Format lot to match what the UI expects (mock subLots)
    const formattedLot = {
      ...lot,
      lotNo: lot.lotNumber,
      itemName: lot.product?.name,
      subLots: [{
        id: lot.id,
        subLotNo: lot.lotNumber,
        status: "READY",
        weight: lot.netWeight || 0,
        pieces: lot.quantity,
        manufacturing: lot.manufacturing.map(m => ({ ...m, totalManufacturingCost: 0 })),
        sales: lot.sales.map(s => ({ ...s, netSale: s.netSale, discount: 0 }))
      }]
    };

    return NextResponse.json({ lot: formattedLot, metrics });
  } catch (error) {
    console.error("Error fetching product history:", error);
    return NextResponse.json({ error: "Failed to fetch product history" }, { status: 500 });
  }
}

