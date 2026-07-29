import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionCookieValue } from "@/lib/session";

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Fill in your name, email, and password." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password needs to be at least 8 characters." }, { status: 400 });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email: sanitizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with that email." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email: sanitizedEmail, passwordHash, role: "CUSTOMER" },
  });

  const sessionValue = createSessionCookieValue({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  cookies().set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
