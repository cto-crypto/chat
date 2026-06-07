import { Suspense } from "react";
import { UserPlus, Users } from "lucide-react";
import { getContacts } from "@/lib/db/queries";
import { NYC_BOROUGHS } from "@/lib/utils";
import { ContactsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string;
    contactType?: string;
    status?: string;
    borough?: string;
    page?: string;
    action?: string;
  }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const { contacts, total, pages } = await getContacts({
    search: params.search,
    contactType: params.contactType,
    status: params.status,
    borough: params.borough,
    page,
    limit: 50,
  });

  return (
    <ContactsPageClient
      contacts={contacts as never}
      total={total}
      page={page}
      pages={pages}
      initialSearch={params.search ?? ""}
      initialType={params.contactType ?? ""}
      initialStatus={params.status ?? ""}
      initialBorough={params.borough ?? ""}
      openAddDialog={params.action === "add"}
    />
  );
}
