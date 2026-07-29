import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const VALID_STATUSES = ["PLACED", "CONFIRMED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];

export async function PATCH(req, { params }) {
  const owner = requireRole("OWNER");
  if (!owner) return NextResponse.json({ error: "Owner login required." }, { status: 403 });

  const { status, note } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await db.order.update({
    where: { id: params.id },
    data: {
      status,
      statusLog: { create: [{ status, note: note || null }] },
    },
  });

  return NextResponse.json({ ok: true });
}
