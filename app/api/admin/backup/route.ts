import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getDemoSession } from "@/lib/demo-auth/session";

export async function POST(_request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["OWNER", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } }).catch(() => null);

  const backup = await prisma.backup.create({
    data: {
      backupType: "manual",
      status: "initiated",
      createdById: profile?.id,
    },
  });

  await prisma.backup.update({
    where: { id: backup.id },
    data: { status: "completed", completedAt: new Date() },
  });

  return NextResponse.json({ success: true, backupId: backup.id });
}

export async function GET(_request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const backups = await prisma.backup.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ backups });
}
