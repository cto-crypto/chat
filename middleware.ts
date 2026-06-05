import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const DEMO_COOKIE = "keevos-demo-session";
const SECRET = new TextEncoder().encode(
  process.env.DEMO_SESSION_SECRET || "keevos-demo-session-secret-32chars"
);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/contacts",
  "/tenants",
  "/properties",
  "/cases",
  "/tasks",
  "/documents",
  "/calendar",
  "/reports",
  "/imports",
  "/integrations",
  "/automations",
  "/settings",
  "/admin",
  "/landlords",
  "/brokers",
  "/caseworkers",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublic(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || !isProtected(pathname)) {
    return NextResponse.next();
  }

  // Check demo session cookie
  const token = request.cookies.get(DEMO_COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      // expired / invalid — fall through
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
