import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "keevos-demo-session";
const SECRET = new TextEncoder().encode(
  process.env.DEMO_SESSION_SECRET || "keevos-demo-session-secret-32chars"
);

export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
}

export const DEMO_USERS: DemoUser[] = [
  { id: "demo-owner-001", email: "owner@keevhousing.com", fullName: "Keev Owner", role: "OWNER" },
  { id: "demo-admin-001", email: "admin@keevhousing.com", fullName: "Keev Admin", role: "ADMIN" },
  { id: "demo-manager-001", email: "manager@keevhousing.com", fullName: "Sarah Johnson", role: "MANAGER" },
  { id: "demo-staff-001", email: "staff@keevhousing.com", fullName: "Mike Torres", role: "STAFF" },
  { id: "demo-viewer-001", email: "viewer@keevhousing.com", fullName: "View Only", role: "VIEWER" },
];

export async function createDemoSession(user: DemoUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function getDemoSession(): Promise<DemoUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as DemoUser;
  } catch {
    return null;
  }
}

export async function verifyDemoToken(token: string): Promise<DemoUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as DemoUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
