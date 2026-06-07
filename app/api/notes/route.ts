import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { NoteSchema } from "@/lib/validations/schemas";
import { getDemoSession } from "@/lib/demo-auth/session";
import { logActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } }).catch(() => null);

  try {
    const body = await request.json();
    const data = NoteSchema.parse(body);
    const note = await prisma.note.create({
      data: {
        ...data,
        createdById: profile?.id,
      },
      include: {
        createdBy: { select: { fullName: true, avatarUrl: true } },
      },
    });

    await logActivity({
      actorId: profile?.id,
      action: "note.created",
      entityType: data.relatedCaseId ? "housing_case" : data.relatedTenantId ? "tenant" : "contact",
      entityId: data.relatedCaseId || data.relatedTenantId || data.relatedContactId || "",
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
