import { prisma } from "@/lib/prisma";

export async function getRejections(organizationId: string, search?: string) {
  const where: any = { organizationId };
  
  // 1. Fetch Purchase Rejections
  const purchaseWhere: any = { 
    organizationId,
    rejectionWeight: { gt: 0 }
  };
  if (search) {
    purchaseWhere.OR = [
      { supplier: { contains: search, mode: "insensitive" } },
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
      { itemName: { contains: search, mode: "insensitive" } },
    ];
  }
  const purchases = await prisma.purchase.findMany({
    where: purchaseWhere,
    include: { lot: true },
    orderBy: { date: "desc" },
  });

  // 2. Fetch Generic/Manufacturing Rejections
  const rejectionWhere: any = { organizationId };
  if (search) {
    rejectionWhere.OR = [
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
      { reason: { contains: search, mode: "insensitive" } },
    ];
  }
  const genericRejections = await prisma.rejection.findMany({
    where: rejectionWhere,
    include: { lot: { include: { product: true } } },
    orderBy: { date: "desc" },
  });

  // 3. Fetch Sales Returns
  const salesWhere: any = { organizationId, isReturn: true };
  if (search) {
    salesWhere.OR = [
      { customer: { contains: search, mode: "insensitive" } },
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
    ];
  }
  const salesReturns = await prisma.sales.findMany({
    where: salesWhere,
    include: { lot: true },
    orderBy: { date: "desc" },
  });

  // Map Purchase rejections to frontend format
  const mappedPurchases = purchases.map(p => ({
    id: p.id,
    date: p.date,
    supplierName: p.supplier,
    itemName: p.itemName,
    rejectionWeight: p.rejectionWeight,
    rejectionPieces: p.rejectionPieces,
    rejectionLines: p.rejectionLines,
    rejectionDate: p.rejectionDate,
    rejectionStatus: p.rejectionStatus,
    weightUnit: p.weightUnit,
    lot: { lotNo: p.lot?.lotNumber }
  }));

  // Map Generic rejections to frontend format (Manufacturing)
  const mappedMfgs = genericRejections.map(r => ({
    id: r.id,
    date: r.date,
    issuedTo: "—", // generic rejections don't have this
    rejectionWeight: r.weight,
    rejectionPieces: r.pieces,
    rejectionLines: r.lines,
    returnToManufacturer: r.sentToManufacturer,
    returnDate: r.date,
    status: (r as any).status || "REJECTED",
    weightUnit: r.lot?.weightUnit || "G",
    lot: { lotNo: r.lot?.lotNumber }
  }));

  // Map Sales returns to frontend format
  const mappedSales = salesReturns.map(s => ({
    id: s.id,
    date: s.date,
    soldTo: s.customer,
    returnedWeight: s.returnedWeight,
    returnedPieces: s.returnedPieces,
    returnedLines: s.returnedLines,
    returnDate: s.returnDate,
    netSale: s.netSale,
    status: "RETURNED",
    weightUnit: s.weightUnit,
    lot: { lotNo: s.lot?.lotNumber }
  }));

  return {
    purchaseRejections: mappedPurchases,
    manufacturingRejections: mappedMfgs,
    salesReturns: mappedSales,
    summary: {
      purchasePending: mappedPurchases.filter(p => p.rejectionStatus === "PENDING").length,
      mfgPending: mappedMfgs.length,
      salesReturnCount: mappedSales.length
    }
  };
}

export async function getRejectionById(type: string, id: string, organizationId: string) {
  if (type === "purchase") {
    const p = await prisma.purchase.findFirst({
      where: { id, organizationId },
      include: { lot: true },
    });
    if (!p) return null;
    return {
      id: p.id,
      type: "purchase",
      date: p.date,
      supplierName: p.supplier,
      itemName: p.itemName,
      rejectionWeight: p.rejectionWeight,
      rejectionPieces: p.rejectionPieces,
      rejectionLines: p.rejectionLines,
      rejectionDate: p.rejectionDate,
      status: p.rejectionStatus,
      weightUnit: p.weightUnit,
      lotNo: p.lot?.lotNumber,
      memo: p.descriptionRef,
      // Additional fields for detail view
      grossWeight: p.grossWeight,
      lessWeight: p.lessWeight,
      pieces: p.pieces,
      lines: p.lines,
    };
  }
  
  if (type === "manufacturing") {
    const r = await prisma.rejection.findFirst({
      where: { id, organizationId },
      include: { lot: true },
    });
    if (!r) return null;
    return {
      id: r.id,
      type: "manufacturing",
      date: r.date,
      reason: r.reason,
      rejectionWeight: r.weight,
      rejectionPieces: r.pieces,
      rejectionLines: r.lines,
      status: (r as any).status || "REJECTED",
      weightUnit: r.lot?.weightUnit || "G",
      lotNo: r.lot?.lotNumber,
      sentToManufacturer: r.sentToManufacturer,
    };
  }

  if (type === "sales") {
    const s = await prisma.sales.findFirst({
      where: { id, organizationId },
      include: { lot: true },
    });
    if (!s) return null;
    return {
      id: s.id,
      type: "sales",
      date: s.date,
      soldTo: s.customer,
      returnedWeight: s.returnedWeight,
      returnedPieces: s.returnedPieces,
      returnedLines: s.returnedLines,
      returnDate: s.returnDate,
      netSale: s.netSale,
      status: s.status || "PENDING",
      weightUnit: s.weightUnit,
      lotNo: s.lot?.lotNumber,
      memo: s.descriptionRef,
    };
  }

  return null;
}

export async function updateRejectionStatus(type: string, id: string, status: string, organizationId: string) {
  if (type === "purchase") {
    return prisma.purchase.update({
      where: { id, organizationId },
      data: { rejectionStatus: status },
    });
  }
  if (type === "manufacturing") {
    return prisma.rejection.update({
      where: { id, organizationId },
      data: { status },
    });
  }
  if (type === "sales") {
    return prisma.sales.update({
      where: { id, organizationId },
      data: { status },
    });
  }
  throw new Error("Invalid rejection type");
}

export async function createRejection(
  data: { lotId: string; reason: string; quantity: number; sentToManufacturer: boolean; date?: Date },
  organizationId: string
) {
  return prisma.$transaction(async (tx) => {
    const rejection = await tx.rejection.create({
      data: {
        lotId: data.lotId,
        reason: data.reason,
        quantity: data.quantity,
        sentToManufacturer: data.sentToManufacturer,
        date: data.date || new Date(),
        organizationId,
      },
      include: { lot: true },
    });

    // Rejection DECREASES available stock
    await tx.stockLedger.create({
      data: {
        productId: rejection.lot.productId,
        transactionType: "REJECTION",
        quantity: -data.quantity, // Negative for rejection
        referenceId: rejection.id,
        organizationId,
      },
    });

    return rejection;
  });
}

export async function deleteRejection(id: string, organizationId: string) {
  return prisma.$transaction(async (tx) => {
    const rejection = await tx.rejection.findFirst({
      where: { id, organizationId },
    });

    if (!rejection) throw new Error("Rejection not found");

    await tx.stockLedger.deleteMany({
      where: { referenceId: id, transactionType: "REJECTION", organizationId },
    });

    return tx.rejection.delete({ where: { id } });
  });
}
