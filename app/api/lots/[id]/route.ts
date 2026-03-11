import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as lotService from "@/lib/services/lotService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const lot = await lotService.getLotById((await params).id, organizationId);
    if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 });
    return NextResponse.json(lot);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    await lotService.deleteLot((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
