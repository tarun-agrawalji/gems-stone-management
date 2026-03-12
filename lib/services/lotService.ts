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
  if (!organizationId) {
    throw new Error("Organization ID is required to create a lot");
  }

  // Auto-heal: ensure organization exists
  await (prisma as any).organization.upsert({
    where: { id: organizationId },
    update: {},
    create: { id: organizationId, name: "Default Organization" },
  });

  // Application-level uniqueness check (lotNumber must be unique per org)
  const existing = await prisma.lot.findFirst({
    where: { lotNumber: data.lotNumber, organizationId },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Lot number "${data.lotNumber}" already exists. Please use a different Lot Number.`);
  }

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
