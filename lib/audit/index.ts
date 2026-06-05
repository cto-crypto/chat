import { prisma } from "@/lib/db/client";

interface AuditParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(params: AuditParams) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues as never,
        newValues: params.newValues as never,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function getActivityForEntity(
  entityType: string,
  entityId: string,
  limit = 50
) {
  return prisma.activityLog.findMany({
    where: { entityType, entityId },
    include: { actor: { select: { fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRecentActivity(limit = 100) {
  return prisma.activityLog.findMany({
    include: { actor: { select: { fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
