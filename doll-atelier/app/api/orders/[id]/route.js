import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(req, { params }) {
  const owner = requireRole("OWNER");
  if (!owner) return NextResponse.json({ error: "Owner login required." }, { status: 403 });

  // Delete order status log events and order items to prevent database constraint errors
  await db.orderStatusEvent.deleteMany({ where: { orderId: params.id } });
  await db.orderItem.deleteMany({ where: { orderId: params.id } });
  
  // Now delete the order
  await db.order.delete({ where: { id: params.id } });
  
  return NextResponse.json({ ok: true });
}
