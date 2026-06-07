import { NextRequest, NextResponse } from "next/server";
import { createDemoSession, DEMO_USERS, COOKIE_NAME } from "@/lib/demo-auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const role = body.role || "ADMIN";

  const user = DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[1];
  const token = await createDemoSession(user);

  const response = NextResponse.json({ success: true, user });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
