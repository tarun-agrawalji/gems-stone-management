import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as manufacturingService from "@/lib/services/manufacturingService";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const manufacturing = await manufacturingService.getManufacturing(organizationId);
    return NextResponse.json(manufacturing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const mfg = await manufacturingService.createManufacturing(body, organizationId);
    return NextResponse.json(mfg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
