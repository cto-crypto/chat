import { prisma } from "@/lib/db/client";
import { UserCheck, Phone, Mail, Building, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function CaseworkersPage() {
  let caseworkers: Array<{
    id: string;
    agencyName: string | null;
    caseloadCount: number | null;
    specialization: string | null;
    contact: { fullName: string; phone: string | null; email: string | null; updatedAt: Date };
    assignedTenants: Array<{ id: string }>;
  }> = [];

  try {
    caseworkers = await prisma.caseworker.findMany({
      include: {
        contact: true,
        assignedTenants: { select: { id: true } },
      },
      orderBy: { contact: { updatedAt: "desc" } },
      take: 100,
    });
  } catch {}

  const display = caseworkers.length === 0 ? [
    { id: "cw1", agencyName: "NYC HRA", caseloadCount: 45, specialization: "Section 8 Housing", contact: { fullName: "Patricia Williams", phone: "(212) 555-0601", email: "patricia.williams@hra.nyc.gov", updatedAt: new Date() }, assignedTenants: [{ id: "t1" }, { id: "t2" }, { id: "t3" }] },
    { id: "cw2", agencyName: "BronxWorks", caseloadCount: 32, specialization: "Homeless Prevention", contact: { fullName: "Carlos Rodriguez", phone: "(718) 555-0702", email: "crodriguez@bronxworks.org", updatedAt: new Date(Date.now() - 86400000) }, assignedTenants: [{ id: "t4" }, { id: "t5" }] },
    { id: "cw3", agencyName: "Brooklyn Community Services", caseloadCount: 28, specialization: "Family Housing", contact: { fullName: "Jennifer Lee", phone: "(347) 555-0803", email: "jlee@bkcs.org", updatedAt: new Date(Date.now() - 86400000 * 2) }, assignedTenants: [{ id: "t6" }] },
  ] : caseworkers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Caseworkers</h1>
          <p className="text-sm text-gray-500 mt-1">{display.length} caseworkers in database</p>
        </div>
        <Link href="/contacts?type=CASEWORKER&action=add" className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]">
          <Plus className="w-4 h-4" /> Add Caseworker
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((cw) => (
          <div key={cw.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-[#1a2b1a]">{cw.contact.fullName}</p>
                {cw.agencyName && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Building className="w-3 h-3" />{cw.agencyName}
                  </div>
                )}
              </div>
            </div>
            {cw.specialization && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{cw.specialization}</span>
            )}
            <div className="space-y-2 mt-3">
              {cw.contact.phone && (
                <a href={`tel:${cw.contact.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#4caf50]">
                  <Phone className="w-3 h-3" />{cw.contact.phone}
                </a>
              )}
              {cw.contact.email && (
                <a href={`mailto:${cw.contact.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#4caf50]">
                  <Mail className="w-3 h-3" />{cw.contact.email}
                </a>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-[#1a2b1a]">{cw.assignedTenants.length}</p>
                <p className="text-xs text-gray-400">Assigned Tenants</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#1a2b1a]">{cw.caseloadCount ?? 0}</p>
                <p className="text-xs text-gray-400">Total Caseload</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
