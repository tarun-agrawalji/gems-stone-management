import { prisma } from "@/lib/prisma";
import { createStockLedgerEntry } from "./inventoryService";

export async function getPurchases(organizationId: string, search?: string) {
  const where: any = { organizationId };
  if (search) {
    where.OR = [
      { supplier: { contains: search, mode: "insensitive" } },
      { lot: { lotNumber: { contains: search, mode: "insensitive" } } },
      { itemName: { contains: search, mode: "insensitive" } },
    ];
  }

  return (prisma as any).purchase.findMany({
    where,
    include: { 
      lot: { 
        include: { 
          product: true 
        } 
      } 
    },
    orderBy: { date: "desc" },
  });
}

export async function createPurchase(
  data: any,
  organizationId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Find or Create Product
    let product = await (tx as any).product.findFirst({
      where: { name: data.itemName || "General Item", organizationId },
    });

    if (!product) {
      product = await (tx as any).product.create({
        data: {
          name: data.itemName || "General Item",
          category: data.category || "ROUGH",
          organizationId,
        },
      });
    }

    // 2. Create the Lot
    const lot = await (tx as any).lot.create({
      data: {
        lotNumber: data.lotNo,
        productId: product.id,
        itemName: data.itemName,
        supplierName: data.supplierName,
        category: data.category,
        descriptionRef: data.descriptionRef,
        grossWeight: data.grossWeight,
        lessWeight: data.lessWeight || 0,
        netWeight: data.grossWeight - (data.lessWeight || 0),
        weightUnit: data.weightUnit || "G",
        size: data.size,
        shape: data.shape,
        pieces: data.pieces,
        lines: data.lines,
        lineLength: data.lineLength,
        quantity: data.pieces || 0,
        status: "IN_STOCK",
        organizationId,
      },
    });

    // 3. Create the Purchase record
    const purchase = await (tx as any).purchase.create({
      data: {
        lotId: lot.id,
        supplier: data.supplierName || data.supplier,
        itemName: data.itemName,
        descriptionRef: data.descriptionRef,
        date: data.date ? new Date(data.date) : new Date(),
        
        grossWeight: data.grossWeight,
        lessWeight: data.lessWeight || 0,
        netWeight: data.grossWeight - (data.lessWeight || 0),
        weightUnit: data.weightUnit || "G",
        
        size: data.size,
        shape: data.shape,
        pieces: data.pieces,
        lines: data.lines,
        lineLength: data.lineLength,
        
        purchasePrice: data.purchasePrice,
        totalCost: data.purchasePrice, // Total cost for the lot
        costPerGram: data.purchasePrice / (data.grossWeight - (data.lessWeight || 0)) || 0,
        
        rejectionWeight: data.rejectionWeight,
        rejectionPieces: data.rejectionPieces,
        rejectionLines: data.rejectionLines,
        rejectionLength: data.rejectionLength,
        rejectionDate: data.rejectionDate ? new Date(data.rejectionDate) : null,
        rejectionStatus: data.rejectionStatus || "PENDING",
 
        organizationId,
      },
    });

    // 4. Update Stock Ledger
    await (tx as any).stockLedger.create({
      data: {
        productId: product.id,
        transactionType: "PURCHASE",
        weight: data.grossWeight - (data.lessWeight || 0),
        quantity: data.pieces,
        referenceId: purchase.id,
        organizationId,
      },
    });

    return purchase;
  });
}

export async function getPurchaseById(id: string, organizationId: string) {
  return (prisma as any).purchase.findFirst({
    where: { id, organizationId },
    include: { 
      lot: { 
        include: { 
          product: true 
        } 
      } 
    },
  });
}

export async function updatePurchase(
  id: string,
  data: any,
  organizationId: string
) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findFirst({
      where: { id, organizationId },
      include: { lot: true },
    });

    if (!purchase) throw new Error("Purchase not found");

    // 1. Update the Lot
    const lot = await (tx as any).lot.update({
      where: { id: purchase.lotId },
      data: {
        lotNumber: data.lotNo,
        itemName: data.itemName,
        supplierName: data.supplierName,
        category: data.category,
        descriptionRef: data.descriptionRef,
        grossWeight: data.grossWeight,
        lessWeight: data.lessWeight || 0,
        netWeight: data.grossWeight - (data.lessWeight || 0),
        weightUnit: data.weightUnit || "G",
        size: data.size,
        shape: data.shape,
        pieces: data.pieces,
        lines: data.lines,
        lineLength: data.lineLength,
        quantity: data.pieces || 0,
      },
    });

    // 2. Update the Purchase record
    const updatedPurchase = await (tx as any).purchase.update({
      where: { id },
      data: {
        supplier: data.supplierName || data.supplier,
        itemName: data.itemName,
        descriptionRef: data.descriptionRef,
        date: data.date ? new Date(data.date) : new Date(),
        
        grossWeight: data.grossWeight,
        lessWeight: data.lessWeight || 0,
        netWeight: data.grossWeight - (data.lessWeight || 0),
        weightUnit: data.weightUnit || "G",
        
        size: data.size,
        shape: data.shape,
        pieces: data.pieces,
        lines: data.lines,
        lineLength: data.lineLength,
        
        purchasePrice: data.purchasePrice,
        totalCost: data.purchasePrice,
        costPerGram: data.purchasePrice / (data.grossWeight - (data.lessWeight || 0)) || 0,
        
        rejectionWeight: data.rejectionWeight,
        rejectionPieces: data.rejectionPieces,
        rejectionLines: data.rejectionLines,
        rejectionLength: data.rejectionLength,
        rejectionDate: data.rejectionDate ? new Date(data.rejectionDate) : null,
        rejectionStatus: data.rejectionStatus || "PENDING",
      },
    });

    // 3. Update Stock Ledger
    await (tx as any).stockLedger.updateMany({
      where: {
        referenceId: id,
        transactionType: "PURCHASE",
        organizationId,
      },
      data: {
        weight: data.grossWeight - (data.lessWeight || 0),
        quantity: data.pieces,
      },
    });

    return updatedPurchase;
  });
}

export async function deletePurchase(id: string, organizationId: string) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findFirst({
      where: { id, organizationId },
      include: { lot: true },
    });

    if (!purchase) throw new Error("Purchase not found");

    // 1. Delete associated Stock Ledger entry
    await tx.stockLedger.deleteMany({
      where: {
        referenceId: id,
        transactionType: "PURCHASE",
        organizationId,
      },
    });

    // 2. Delete the purchase
    const result = await tx.purchase.delete({
      where: { id },
    });
    
    // 3. Delete the lot too since they are 1:1 in this context
    if (purchase.lotId) {
      await tx.lot.delete({
        where: { id: purchase.lotId }
      });
    }

    return result;
  });
}
