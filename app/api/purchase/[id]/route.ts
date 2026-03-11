import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import * as purchaseService from "@/lib/services/purchaseService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const purchase = await purchaseService.getPurchaseById((await params).id, organizationId);
    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const purchase = await purchaseService.updatePurchase((await params).id, body, organizationId);
    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    await purchaseService.deletePurchase((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
