import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req) {
  const owner = requireRole("OWNER");
  if (!owner) {
    return NextResponse.json({ error: "Owner login required." }, { status: 403 });
  }

  const { name, description, priceInPaise, photoUrl, stock } = await req.json();
  if (!name || !description || !priceInPaise || !photoUrl) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name,
      description,
      priceInPaise: Number(priceInPaise),
      photoUrl,
      stock: Number(stock) || 1,
    },
  });

  return NextResponse.json(product);
}
