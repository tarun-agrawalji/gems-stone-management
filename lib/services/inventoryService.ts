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

  return ledgers.reduce((total, entry) => total + entry.quantity, 0);
}
