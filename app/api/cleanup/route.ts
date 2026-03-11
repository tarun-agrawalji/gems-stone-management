import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lots = await prisma.lot.findMany();
    const testLots = lots.filter(l => l.lotNumber.startsWith('TEST-'));
    
    let deleted = 0;
    if (testLots.length > 0) {
      for (const lot of testLots) {
        await prisma.stockLedger.deleteMany({ where: { referenceId: lot.id } });
        await prisma.purchase.deleteMany({ where: { lotId: lot.id } });
        await prisma.manufacturing.deleteMany({ where: { lotId: lot.id } });
        await prisma.sales.deleteMany({ where: { lotId: lot.id } });
        await prisma.rejection.deleteMany({ where: { lotId: lot.id } });

        await prisma.lot.delete({ where: { id: lot.id } });
        deleted++;
      }
    }
    return NextResponse.json({ message: `Deleted ${deleted} test lots.` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
