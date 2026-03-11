import { prisma } from "@/lib/prisma";

export async function getProducts(organizationId: string) {
  return prisma.product.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(data: { name: string; category: string; description?: string; }, organizationId: string) {
  return prisma.product.create({
    data: {
      ...data,
      organizationId,
    },
  });
}

export async function getProductById(id: string, organizationId: string) {
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: { lots: true },
  });
}

export async function deleteProduct(id: string, organizationId: string) {
  // Ensure the product belongs to the organization before deleting
  return prisma.product.delete({
    where: { id, organizationId },
  });
}
