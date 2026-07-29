import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// PAYMENT INTEGRATION NOTE: in production this route should only run after
// Razorpay confirms payment (either client-side verification of the payment
// signature, or better, a server-side webhook). Right now it simulates a
// successful payment and grants access immediately, which is fine for
// building/testing the rest of the flow.
export async function POST(req, { params }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const video = await db.video.findUnique({ where: { id: params.id } });
  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  const existing = await db.videoAccess.findUnique({
    where: { userId_videoId: { userId: user.id, videoId: video.id } },
  });
  if (existing) return NextResponse.json({ ok: true, alreadyOwned: true });

  await db.videoAccess.create({ data: { userId: user.id, videoId: video.id } });

  return NextResponse.json({ ok: true });
}
