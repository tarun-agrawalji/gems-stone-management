import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const ledger = await prisma.stockLedger.findMany({
      where: { organizationId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ledger);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
