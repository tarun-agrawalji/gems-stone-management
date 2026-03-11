import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();

    const [
      totalLots,
      purchaseAgg,
      salesAgg,
      rejectionAgg,
      totalPurchases,
      totalSales
    ] = await Promise.all([
      prisma.lot.count({ where: { organizationId } }),
      prisma.purchase.aggregate({
        where: { organizationId },
        _sum: { purchasePrice: true }
      }),
      prisma.sales.aggregate({
        where: { organizationId },
        _sum: { salePrice: true }
      }),
      prisma.rejection.count({
        where: { organizationId, sentToManufacturer: false } // Pending rejection assumption
      }),
      prisma.purchase.count({ where: { organizationId } }),
      prisma.sales.count({ where: { organizationId } })
    ]);

    const purchaseValue = purchaseAgg._sum.purchasePrice || 0;
    const salesValue = salesAgg._sum.salePrice || 0;
    const netProfitLoss = salesValue - purchaseValue;

    return NextResponse.json({
      totalLots,
      totalSubLots: totalLots, // Assuming SubLots are merged to lots now
      purchaseValue,
      salesValue,
      netProfitLoss,
      rejectionPending: rejectionAgg,
      totalTransactions: totalPurchases + totalSales,
      transactionBreakdown: `${totalPurchases} purchases · ${totalSales} sales`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
