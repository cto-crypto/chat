import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getDemoSession } from "@/lib/demo-auth/session";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileType: z.string(),
  fileSize: z.number().max(MAX_SIZE),
  documentType: z.enum(["VOUCHER", "ID", "LEASE", "INSPECTION", "APPLICATION", "INCOME_PROOF", "UTILITY_BILL", "OTHER"]),
  relatedContactId: z.string().optional().nullable(),
  relatedTenantId: z.string().optional().nullable(),
  relatedPropertyId: z.string().optional().nullable(),
  relatedCaseId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || undefined;
  const caseId = searchParams.get("caseId") || undefined;

  const where: Record<string, unknown> = {};
  if (tenantId) where.relatedTenantId = tenantId;
  if (caseId) where.relatedCaseId = caseId;

  const documents = await prisma.document.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } }).catch(() => null);

  try {
    const body = await request.json();
    const data = DocumentUploadSchema.parse(body);

    if (!ALLOWED_TYPES.includes(data.fileType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        ...data,
        uploadedById: profile?.id,
      },
    });

    await logActivity({
      actorId: profile?.id,
      action: "document.uploaded",
      entityType: "document",
      entityId: document.id,
      newValues: { fileName: data.fileName, documentType: data.documentType },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["OWNER", "ADMIN", "MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } }).catch(() => null);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Document ID required" }, { status: 400 });

  await prisma.document.delete({ where: { id } });

  await logActivity({
    actorId: profile?.id,
    action: "document.deleted",
    entityType: "document",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
