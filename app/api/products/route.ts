import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import * as productService from "@/lib/services/productService";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();
    const products = await productService.getProducts(organizationId);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const product = await productService.createProduct(body, organizationId);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
