import { prisma } from "@/lib/prisma";

export async function getSales(organizationId: string, search?: string) {
  const where: any = { organizationId };
  if (search) {
    where.OR = [
      { customer: { contains: search, mode: "insensitive" } },
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
      { billNo: { contains: search, mode: "insensitive" } },
      { itemName: { contains: search, mode: "insensitive" } },
    ];
  }
  return (prisma as any).sales.findMany({
    where,
    include: { lot: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
}

export async function createSale(
  data: any,
  organizationId: string
) {
  if (!organizationId) {
    throw new Error("Organization ID is required to create a sale");
  }

  // Auto-heal: ensure organization exists
  await (prisma as any).organization.upsert({
    where: { id: organizationId },
    update: {},
    create: { id: organizationId, name: "Default Organization" },
  });

  return prisma.$transaction(async (tx) => {
    // 1. Create Sale Record
    const sale = await (tx as any).sales.create({
      data: {
        lotId: data.lotId,
        customer: data.customerName || data.customer,
        billNo: data.billNo,
        date: data.date ? new Date(data.date) : new Date(),
        itemName: data.itemName,
        descriptionRef: data.descriptionRef,
        
        weight: data.weight,
        weightUnit: data.weightUnit || "G",
        pieces: data.pieces,
        shape: data.shape,
        size: data.size,
        lines: data.lines,
        length: data.lineLength || data.length,
        
        salePrice: data.salePrice,
        discount: data.discount || 0,
        tax: data.tax || 0,
        netSale: data.netSale,
        finalBillAmount: data.finalBillAmount,
        
        organizationId,
      },
      include: { lot: true },
    });

    // 2. Update Lot Status (if fully sold or partially sold)
    // For now, let's assume it's FULLY sold unless specified
    await (tx as any).lot.update({
      where: { id: data.lotId },
      data: { 
        status: data.isPartial ? "PARTIALLY_SOLD" : "SOLD" 
      },
    });

    // 3. Stock Ledger Entry
    await (tx as any).stockLedger.create({
      data: {
        productId: sale.lot.productId,
        transactionType: "SALE",
        weight: -data.weight, // Negative for sale
        quantity: -(data.pieces || 0),
        referenceId: sale.id,
        organizationId,
      },
    });

    return sale;
  });
}

export async function deleteSale(id: string, organizationId: string) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sales.findFirst({
      where: { id, organizationId },
    });

    if (!sale) throw new Error("Sale not found");

    await tx.stockLedger.deleteMany({
      where: { referenceId: id, transactionType: "SALE", organizationId },
    });

    return tx.sales.delete({ where: { id } });
  });
}
