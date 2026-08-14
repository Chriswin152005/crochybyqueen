import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateSignedPlaybackUrl } from "@/lib/video";

export async function GET(req, { params }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const access = await db.videoAccess.findUnique({
    where: { userId_videoId: { userId: user.id, videoId: params.id } },
  });
  if (!access) {
    return NextResponse.json({ error: "You haven't unlocked this video yet." }, { status: 403 });
  }

  const url = await generateSignedPlaybackUrl(params.id, user.id);
  return NextResponse.json({ url });
}

