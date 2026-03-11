import { prisma } from "./prisma";



export async function createLedgerEntry(data: {
  lotId?: string;
  subLotId?: string;
  fromLocation: string;
  toLocation: string;
  weight: number;
  weightUnit: string;
  pieces?: number;
  referenceType: string;
  referenceId: string;
  notes?: string;
}) {
  return prisma.stockLedger.create({
    data: {
      date: new Date(),
      lotId: data.lotId,
      subLotId: data.subLotId,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      weight: data.weight,
      weightUnit: data.weightUnit as any,
      pieces: data.pieces,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      notes: data.notes,
    },
  });
}

export async function generateNextSubLotNo(lotId: string): Promise<string> {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: { subLots: true }
  });
  if (!lot) throw new Error("Lot not found");

  let maxChar = 64; // Before 'A'
  let maxNum = 0;

  for (const sl of lot.subLots) {
    const parts = sl.subLotNo.split('-');
    if (parts.length > 1) {
      const suffix = parts[parts.length - 1];
      if (suffix.length === 1 && suffix >= 'A' && suffix <= 'Z') {
        const code = suffix.charCodeAt(0);
        if (code > maxChar) maxChar = code;
      } else {
        const num = parseInt(suffix);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
  }

  if (maxNum > 0 || maxChar >= 90) {
    return `${lot.lotNo}-${Math.max(maxNum, 26) + 1}`;
  }

  return `${lot.lotNo}-${String.fromCharCode(maxChar + 1)}`;
}
