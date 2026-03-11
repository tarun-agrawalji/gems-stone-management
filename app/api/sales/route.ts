import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as salesService from "@/lib/services/salesService";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const sales = await salesService.getSales(organizationId);
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const sale = await salesService.createSale(body, organizationId);
    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
