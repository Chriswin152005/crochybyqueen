import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionCookieValue } from "@/lib/session";

export async function POST(req) {
  const { email, password } = await req.json();
  const sanitizedEmail = email ? email.trim().toLowerCase() : "";

  const user = await db.user.findUnique({ where: { email: sanitizedEmail } });
  if (!user) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

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

  return NextResponse.json({ ok: true, role: user.role });
}
