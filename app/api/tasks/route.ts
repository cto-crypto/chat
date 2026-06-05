import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { TaskSchema } from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const assignedTo = searchParams.get("assignedTo") || undefined;
  const overdue = searchParams.get("overdue") === "true";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (assignedTo) where.assignedToId = assignedTo;
  if (overdue) {
    where.dueDate = { lt: new Date() };
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: { fullName: true } },
      relatedCase: { select: { caseNumber: true } },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    take: 100,
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } });

  try {
    const body = await request.json();
    const data = TaskSchema.parse(body);
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: profile?.id,
      },
    });

    await logActivity({
      actorId: profile?.id,
      action: "task.created",
      entityType: "task",
      entityId: task.id,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...updates,
      completedAt: updates.status === "COMPLETED" ? new Date() : null,
    },
  });

  await logActivity({
    actorId: profile?.id,
    action: updates.status === "COMPLETED" ? "task.completed" : "task.updated",
    entityType: "task",
    entityId: task.id,
  });

  return NextResponse.json(task);
}
