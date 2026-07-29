import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Owner-only. Accepts a multipart form with one "file" field and a "kind"
// field ("photo" | "video"). Photos land in /public/uploads (servable
// directly — they're not the thing we're protecting). Videos land in
// /private-videos, OUTSIDE the public folder, so they can only ever be
// reached through the signed-playback-token route in lib/video.js.
export async function POST(req) {
  const owner = requireRole("OWNER");
  if (!owner) {
    return NextResponse.json({ error: "Owner login required." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
  const filename = `${crypto.randomUUID()}${ext}`;

  if (kind === "video") {
    const dir = path.join(process.cwd(), "private-videos");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ storedPath: filename });
  } else {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}` });
  }
}
