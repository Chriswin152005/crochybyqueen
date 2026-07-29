import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(req, { params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req, { params }) {
  const owner = requireRole("OWNER");
  if (!owner) return NextResponse.json({ error: "Owner login required." }, { status: 403 });

  // Delete matching order items to prevent database relation errors
  await db.orderItem.deleteMany({ where: { productId: params.id } });
  
  // Now delete the product
  await db.product.delete({ where: { id: params.id } });
  
  return NextResponse.json({ ok: true });
}
