import { Home, UserPlus } from "lucide-react";
import { getTenants, getDashboardStats } from "@/lib/db/queries";
import { NYC_BOROUGHS, URGENCY_COLORS } from "@/lib/utils";
import { TenantsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

interface TenantsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    urgency?: string;
    borough?: string;
    voucherSize?: string;
    page?: string;
    action?: string;
  }>;
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const [{ tenants, total, pages }, stats] = await Promise.all([
    getTenants({
      search: params.search,
      status: params.status,
      urgency: params.urgency,
      borough: params.borough,
      voucherSize: params.voucherSize ? parseInt(params.voucherSize) : undefined,
      page,
      limit: 50,
    }),
    getDashboardStats(),
  ]);

  // Get counts for status tabs
  const [newCount, searchingCount, applicationCount, housedCount] = await Promise.all([
    getTenants({ status: "NEW", limit: 1 }).then((r) => r.total),
    getTenants({ status: "SEARCHING", limit: 1 }).then((r) => r.total),
    getTenants({ status: "APPLICATION_SUBMITTED", limit: 1 }).then((r) => r.total),
    getTenants({ status: "HOUSED", limit: 1 }).then((r) => r.total),
  ]);

  return (
    <TenantsPageClient
      tenants={tenants as never}
      total={total}
      page={page}
      pages={pages}
      stats={{
        total: stats.activeTenants,
        newCount,
        searchingCount,
        applicationCount,
        housedCount,
      }}
      initialSearch={params.search ?? ""}
      initialStatus={params.status ?? ""}
      initialUrgency={params.urgency ?? ""}
      initialBorough={params.borough ?? ""}
      initialVoucherSize={params.voucherSize ?? ""}
      openAddDialog={params.action === "add"}
    />
  );
}
