import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ContactSchema } from "@/lib/validations/schemas";
import { requireApiKey, rateLimit, getClientIp } from "@/lib/security/api-auth";
import { logActivity } from "@/lib/audit";
import { generateCaseNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const ip = getClientIp(request);
  if (!rateLimit(`contacts-get-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const contactType = searchParams.get("contactType") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (contactType) where.contactType = contactType;
  if (status) where.status = status;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: "desc" } }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({ contacts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = ContactSchema.parse(body);
    const contact = await prisma.contact.create({ data });
    await logActivity({ action: "contact.created", entityType: "contact", entityId: contact.id, newValues: contact as never });
    return NextResponse.json(contact, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
