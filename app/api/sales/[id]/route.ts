import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as salesService from "@/lib/services/salesService";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    await salesService.deleteSale((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
