import { prisma } from "@/lib/prisma";

export async function createStockLedgerEntry({
  productId,
  transactionType,
  quantity,
  referenceId,
  organizationId,
}: {
  productId: string;
  transactionType: "PURCHASE" | "SALE" | "MANUFACTURING_ISSUE" | "MANUFACTURING_RECEIPT" | "REJECTION";
  quantity: number;
  referenceId: string;
  organizationId: string;
}) {
  if (!organizationId) {
    throw new Error("Organization ID is required to create a stock ledger entry");
  }

  // Auto-heal: ensure organization exists
  await (prisma as any).organization.upsert({
    where: { id: organizationId },
    update: {},
    create: { id: organizationId, name: "Default Organization" },
  });

  return prisma.stockLedger.create({
    data: {
      productId,
      transactionType,
      quantity,
      referenceId,
      organizationId,
    },
  });
}

export async function getProductStock(productId: string, organizationId: string) {
  const ledgers = await prisma.stockLedger.findMany({
    where: {
      productId,
      organizationId,
    },
    select: {
      quantity: true,
    },
  });

  return ledgers.reduce((total, entry) => total + (entry.quantity || 0), 0);
}
