import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { HousingCaseSchema } from "@/lib/validations/schemas";
import { requireApiKey, rateLimit, getClientIp } from "@/lib/security/api-auth";
import { logActivity } from "@/lib/audit";
import { generateCaseNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const ip = getClientIp(request);
  if (!rateLimit(`cases-get-${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [cases, total] = await Promise.all([
    prisma.housingCase.findMany({
      where,
      include: { tenant: { include: { contact: true } }, property: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.housingCase.count({ where }),
  ]);

  return NextResponse.json({ cases, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = HousingCaseSchema.parse(body);
    const housingCase = await prisma.housingCase.create({
      data: { ...data, caseNumber: generateCaseNumber() },
    });
    await logActivity({ action: "case.created", entityType: "housing_case", entityId: housingCase.id, newValues: housingCase as never });
    return NextResponse.json(housingCase, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
