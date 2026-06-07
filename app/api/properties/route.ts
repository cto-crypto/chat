import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { PropertySchema } from "@/lib/validations/schemas";
import { requireApiKey, rateLimit, getClientIp } from "@/lib/security/api-auth";
import { logActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const ip = getClientIp(request);
  if (!rateLimit(`properties-get-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const borough = searchParams.get("borough") || undefined;
  const voucherAccepted = searchParams.get("voucherAccepted");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (borough) where.borough = borough;
  if (voucherAccepted !== null) where.voucherAccepted = voucherAccepted === "true";

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: "desc" } }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ properties, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = PropertySchema.parse(body);
    const property = await prisma.property.create({ data });
    await logActivity({ action: "property.created", entityType: "property", entityId: property.id, newValues: property as never });
    return NextResponse.json(property, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
