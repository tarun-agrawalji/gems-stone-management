import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as productService from "@/lib/services/productService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const product = await productService.getProductById((await params).id, organizationId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    await productService.deleteProduct((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
