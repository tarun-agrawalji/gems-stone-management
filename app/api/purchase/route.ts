import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import * as purchaseService from "@/lib/services/purchaseService";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const purchases = await purchaseService.getPurchases(organizationId);
    return NextResponse.json(purchases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const purchase = await purchaseService.createPurchase(body, organizationId);
    return NextResponse.json(purchase, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
