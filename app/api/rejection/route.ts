import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as rejectionService from "@/lib/services/rejectionService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    
    const { organizationId } = await getTenantContext();
    const rejections = await rejectionService.getRejections(organizationId, search);
    return NextResponse.json(rejections);
  } catch (error: any) {
    console.error("[API Rejection GET]", error);
    const message = error?.message || String(error) || "Unknown error in rejection API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const rejection = await rejectionService.createRejection(body, organizationId);
    return NextResponse.json(rejection, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const { recordType, id, status } = await req.json();
    const result = await rejectionService.updateRejectionStatus(recordType, id, status, organizationId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Rejection PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

