import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Public list — deliberately excludes sourcePath so the private file
// location is never sent to the browser, purchased or not.
export async function GET() {
  const videos = await db.video.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      priceInPaise: true,
      thumbnailUrl: true,
      createdAt: true,
    },
  });
  return NextResponse.json(videos);
}

export async function POST(req) {
  const owner = requireRole("OWNER");
  if (!owner) return NextResponse.json({ error: "Owner login required." }, { status: 403 });

  const { title, description, priceInPaise, thumbnailUrl, sourcePath } = await req.json();
  if (!title || !description || !priceInPaise || !thumbnailUrl || !sourcePath) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const video = await db.video.create({
    data: {
      title,
      description,
      priceInPaise: Number(priceInPaise),
      thumbnailUrl,
      sourcePath,
    },
  });

  return NextResponse.json(video);
}
