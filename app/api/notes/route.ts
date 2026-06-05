import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { NoteSchema } from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } });

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
