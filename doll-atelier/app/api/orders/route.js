import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const where = user.role === "OWNER" ? {} : { customerId: user.id };

  const orders = await db.order.findMany({
    where,
    include: { items: { include: { product: true } }, customer: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// This is the "checkout" endpoint for physical dolls.
// Supports both single-product direct checkout and multi-item cart checkouts.
export async function POST(req) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { productId, quantity, items, shippingName, shippingAddr, shippingPhone } = await req.json();

  if (!shippingName || !shippingAddr || !shippingPhone) {
    return NextResponse.json({ error: "Missing shipping details." }, { status: 400 });
  }

  let checkoutItems = [];
  if (items && Array.isArray(items) && items.length > 0) {
    checkoutItems = items;
  } else if (productId) {
    checkoutItems = [{ productId, quantity: Number(quantity) || 1 }];
  } else {
    return NextResponse.json({ error: "No items to checkout." }, { status: 400 });
  }

  // Fetch all products in the checkout list
  const productIds = checkoutItems.map((i) => i.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: "Some products in the cart were not found." }, { status: 404 });
  }

  let totalInPaise = 0;
  const createItems = [];

  for (const item of checkoutItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    
    const qty = Math.max(1, Number(item.quantity) || 1);
    totalInPaise += product.priceInPaise * qty;
    
    createItems.push({
      productId: product.id,
      quantity: qty,
      priceInPaise: product.priceInPaise,
    });
  }

  const order = await db.order.create({
    data: {
      customerId: user.id,
      totalInPaise,
      shippingName,
      shippingAddr,
      shippingPhone,
      status: "PLACED",
      items: {
        create: createItems,
      },
      statusLog: {
        create: [{ status: "PLACED", note: "Order placed and payment received." }],
      },
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
