import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import path from "path";
import crypto from "crypto";

export async function POST(req) {
  const owner = requireRole("OWNER");
  if (!owner) {
    return NextResponse.json({ error: "Owner login required." }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not configured. Check your env variables." },
      { status: 500 }
    );
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
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filename, bytes, {
        contentType: file.type || "video/mp4",
        duplex: "half",
      });

    if (error) {
      return NextResponse.json({ error: `Video upload failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ storedPath: filename });
  } else {
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
        duplex: "half",
      });

    if (error) {
      return NextResponse.json({ error: `Photo upload failed: ${error.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  }
}
