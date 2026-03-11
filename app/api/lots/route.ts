import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as lotService from "@/lib/services/lotService";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const lots = await lotService.getLots(organizationId);
    return NextResponse.json(lots);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const lot = await lotService.createLot(body, organizationId);
    return NextResponse.json(lot, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
