import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import * as rejectionService from "@/lib/services/rejectionService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const { organizationId } = await getTenantContext();
    const rejection = await rejectionService.getRejectionById(type, id, organizationId);
    
    if (!rejection) {
      return NextResponse.json({ error: `Rejection not found (Type: ${type}, ID: ${id})` }, { status: 404 });
    }
    
    return NextResponse.json(rejection);
  } catch (error: any) {
    console.error("[API Rejection Item GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const { organizationId } = await getTenantContext();
    const { status } = await req.json();
    
    const updated = await rejectionService.updateRejectionStatus(type, id, status, organizationId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[API Rejection Item PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const { organizationId } = await getTenantContext();
    
    if (type === "manufacturing") {
      await rejectionService.deleteRejection(id, organizationId);
    } else {
      return NextResponse.json({ error: `Deletion for ${type} rejections is not supported here.` }, { status: 400 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[API Rejection Item DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
