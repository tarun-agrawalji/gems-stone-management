import { prisma } from "@/lib/prisma";

export async function getLots(organizationId: string) {
  return prisma.lot.findMany({
    where: { organizationId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLot(
  data: { lotNumber: string; productId: string; weight?: number; quantity: number },
  organizationId: string
) {
  return prisma.lot.create({
    data: {
      ...data,
      organizationId,
    },
  });
}

export async function getLotById(id: string, organizationId: string) {
  return prisma.lot.findFirst({
    where: { id, organizationId },
    include: { product: true, purchases: true, sales: true },
  });
}

export async function deleteLot(id: string, organizationId: string) {
  return prisma.lot.delete({
    where: { id, organizationId },
  });
}
