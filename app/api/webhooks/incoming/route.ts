import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { logActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, source } = body;

    if (!event || !data) {
      return NextResponse.json({ error: "Missing event or data" }, { status: 400 });
    }

    await logActivity({
      action: `webhook.received.${event}`,
      entityType: "webhook",
      entityId: source || "external",
      newValues: { event, data },
    });

    return NextResponse.json({ received: true, event });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
