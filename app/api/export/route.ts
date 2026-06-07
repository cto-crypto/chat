import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getDemoSession } from "@/lib/demo-auth/session";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  const user = await getDemoSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "contacts";
  const format = searchParams.get("format") || "csv";

  let data: Record<string, unknown>[] = [];
  const filename = `keevos-${type}-export`;

  try {
    switch (type) {
      case "contacts":
        data = (await prisma.contact.findMany({ orderBy: { createdAt: "desc" } })).map(c => ({
          id: c.id,
          full_name: c.fullName,
          contact_type: c.contactType,
          phone: c.phone,
          email: c.email,
          address: c.address,
          borough: c.borough,
          neighborhood: c.neighborhood,
          organization: c.organization,
          status: c.status,
          tags: c.tags.join(";"),
          source: c.source,
          created_at: c.createdAt.toISOString(),
        }));
        break;

      case "tenants": {
        const tenants = await prisma.tenant.findMany({
          include: { contact: true },
          orderBy: { createdAt: "desc" },
        });
        data = tenants.map(t => ({
          id: t.id,
          full_name: t.contact.fullName,
          phone: t.contact.phone,
          email: t.contact.email,
          voucher_type: t.voucherType,
          voucher_size: t.voucherSize,
          voucher_number: t.voucherNumber,
          max_rent: t.maxRent?.toString(),
          preferred_boroughs: t.preferredBoroughs.join(";"),
          urgency_level: t.urgencyLevel,
          tenant_status: t.tenantStatus,
          documents_complete: t.documentsComplete,
          created_at: t.createdAt.toISOString(),
        }));
        break;
      }

      case "properties": {
        const properties = await prisma.property.findMany({ orderBy: { createdAt: "desc" } });
        data = properties.map(p => ({
          id: p.id,
          address: p.address,
          borough: p.borough,
          neighborhood: p.neighborhood,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms?.toString(),
          rent: p.rent.toString(),
          voucher_accepted: p.voucherAccepted,
          status: p.status,
          availability_date: p.availabilityDate?.toISOString(),
          created_at: p.createdAt.toISOString(),
        }));
        break;
      }

      case "cases": {
        const cases = await prisma.housingCase.findMany({
          include: { tenant: { include: { contact: true } } },
          orderBy: { createdAt: "desc" },
        });
        data = cases.map(c => ({
          id: c.id,
          case_number: c.caseNumber,
          tenant_name: c.tenant?.contact.fullName,
          status: c.status,
          priority: c.priority,
          move_in_target: c.moveInTargetDate?.toISOString(),
          next_follow_up: c.nextFollowUpDate?.toISOString(),
          created_at: c.createdAt.toISOString(),
        }));
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  if (format === "csv") {
    const csv = Papa.unparse(data);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  return NextResponse.json(data);
}
