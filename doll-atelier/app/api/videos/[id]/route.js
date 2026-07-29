import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(req, { params }) {
  const owner = requireRole("OWNER");
  if (!owner) return NextResponse.json({ error: "Owner login required." }, { status: 403 });

  // Delete video accesses to prevent database relationship errors
  await db.videoAccess.deleteMany({ where: { videoId: params.id } });
  
  // Now delete the video
  await db.video.delete({ where: { id: params.id } });
  
  return NextResponse.json({ ok: true });
}
