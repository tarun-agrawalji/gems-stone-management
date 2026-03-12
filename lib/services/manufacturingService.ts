import { prisma } from "@/lib/prisma";

export async function getManufacturing(organizationId: string, search?: string) {
  const where: any = { organizationId };
  if (search) {
    where.OR = [
      { processType: { contains: search, mode: "insensitive" } },
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
      { issuedTo: { contains: search, mode: "insensitive" } },
    ];
  }
  return (prisma as any).manufacturing.findMany({
    where,
    include: { lot: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
}

export async function createManufacturing(
  data: any,
  organizationId: string
) {
  if (!organizationId) {
    throw new Error("Organization ID is required to create a manufacturing record");
  }

  // Auto-heal: ensure organization exists
  await (prisma as any).organization.upsert({
    where: { id: organizationId },
    update: {},
    create: { id: organizationId, name: "Default Organization" },
  });

  return prisma.$transaction(async (tx) => {
    // 1. Create Manufacturing Record
    const mfg = await (tx as any).manufacturing.create({
      data: {
        lotId: data.lotId,
        issuedTo: data.issuedTo,
        processType: data.processType,
        date: data.date ? new Date(data.date) : new Date(),
        
        weight: data.weight,
        weightUnit: data.weightUnit || "G",
        pieces: data.pieces,
        shape: data.shape,
        size: data.size,
        lines: data.lines,
        length: data.lineLength || data.length,
        
        labourCost: data.labourCost || 0,
        otherCost: data.otherCost || 0,
        totalManufacturingCost: (data.labourCost || 0) + (data.otherCost || 0),
        
        status: data.status || "COMPLETED",
        outputQuantity: data.outputQuantity || data.pieces,
        organizationId,
      },
      include: { lot: true },
    });

    // 2. Update Lot Status
    await (tx as any).lot.update({
      where: { id: data.lotId },
      data: { 
        status: data.status === "COMPLETED" ? "READY" : "IN_PROCESS" 
      },
    });

    // 3. Stock Ledger Entry
    await (tx as any).stockLedger.create({
      data: {
        productId: mfg.lot.productId,
        transactionType: "MANUFACTURING_RECEIPT",
        weight: data.weight,
        quantity: data.pieces,
        referenceId: mfg.id,
        organizationId,
      },
    });

    return mfg;
  });
}

export async function deleteManufacturing(id: string, organizationId: string) {
  return prisma.$transaction(async (tx) => {
    const mfg = await tx.manufacturing.findFirst({
      where: { id, organizationId },
    });

    if (!mfg) throw new Error("Manufacturing record not found");

    // Remove ledger entry
    await tx.stockLedger.deleteMany({
      where: { referenceId: id, transactionType: "MANUFACTURING_RECEIPT", organizationId },
    });

    return tx.manufacturing.delete({ where: { id } });
  });
}
