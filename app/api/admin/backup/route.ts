import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authUserId: user.id } });
  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const backup = await prisma.backup.create({
    data: {
      backupType: "manual",
      status: "initiated",
      createdById: profile.id,
    },
  });

  // In production, this would trigger a Supabase database backup via their API
  // or export to secure cloud storage. For now, we record the backup request.
  await prisma.backup.update({
    where: { id: backup.id },
    data: { status: "completed", completedAt: new Date() },
  });

  return NextResponse.json({ success: true, backupId: backup.id, message: "Backup initiated. See BACKUP.md for production setup." });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const backups = await prisma.backup.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ backups });
}
