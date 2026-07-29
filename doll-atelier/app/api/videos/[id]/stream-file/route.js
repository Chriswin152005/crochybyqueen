import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPlaybackToken } from "@/lib/video";
import { createReadStream, statSync } from "fs";
import path from "path";

// This is the only route that ever touches the actual video file. It never
// runs unless the token from generateSignedPlaybackUrl() is present and
// still valid (checked in lib/video.js) — so this URL is useless once it
// expires (10 minutes) or if someone edits the query string.
export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");
  const uid = searchParams.get("uid");

  const valid = verifyPlaybackToken(params.id, uid, expires, sig);
  if (!valid) {
    return NextResponse.json({ error: "This video link has expired." }, { status: 403 });
  }

  const video = await db.video.findUnique({ where: { id: params.id } });
  if (!video) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const filePath = path.join(process.cwd(), "private-videos", video.sourcePath);
  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    return NextResponse.json({ error: "Video file missing on server." }, { status: 404 });
  }

  const range = req.headers.get("range");
  const headers = new Headers({
    "Content-Type": "video/mp4",
    // "inline" (not "attachment") — the browser plays it, no save-as prompt
    "Content-Disposition": "inline",
    "Accept-Ranges": "bytes",
  });

  if (range) {
    const [startStr, endStr] = range.replace("bytes=", "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunkSize = end - start + 1;

    headers.set("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    headers.set("Content-Length", chunkSize.toString());

    const stream = createReadStream(filePath, { start, end });
    return new NextResponse(stream, { status: 206, headers });
  }

  headers.set("Content-Length", stat.size.toString());
  const stream = createReadStream(filePath);
  return new NextResponse(stream, { status: 200, headers });
}
