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
    return NextResponse.json({ error: error.message }, { status: 401 });
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
