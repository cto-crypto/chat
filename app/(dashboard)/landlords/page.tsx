import { prisma } from "@/lib/db/client";
import { Building2, Phone, Mail, CheckCircle, XCircle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function LandlordsPage() {
  let landlords: Array<{
    id: string;
    companyName: string | null;
    portfolioSize: number | null;
    acceptsVouchers: boolean;
    section8Friendly: boolean;
    contact: { fullName: string; phone: string | null; email: string | null; borough: string | null; status: string; updatedAt: Date };
    properties: Array<{ id: string; status: string }>;
  }> = [];

  try {
    landlords = await prisma.landlord.findMany({
      include: {
        contact: true,
        properties: { select: { id: true, status: true } },
      },
      orderBy: { contact: { updatedAt: "desc" } },
      take: 100,
    });
  } catch {
    // Demo mode
  }

  const mockLandlords = landlords.length === 0 ? [
    { id: "l1", companyName: "Bronx Realty Holdings", portfolioSize: 45, acceptsVouchers: true, section8Friendly: true, contact: { fullName: "Robert Martinez", phone: "(718) 555-0101", email: "robert@bronxrealty.com", borough: "Bronx", status: "ACTIVE", updatedAt: new Date() }, properties: [{ id: "p1", status: "AVAILABLE" }, { id: "p2", status: "OCCUPIED" }] },
    { id: "l2", companyName: "Brooklyn Heights Properties", portfolioSize: 28, acceptsVouchers: false, section8Friendly: false, contact: { fullName: "Susan Park", phone: "(347) 555-0202", email: "susan@bhproperties.com", borough: "Brooklyn", status: "ACTIVE", updatedAt: new Date(Date.now() - 86400000) }, properties: [{ id: "p3", status: "AVAILABLE" }] },
    { id: "l3", companyName: "Queens Gateway LLC", portfolioSize: 12, acceptsVouchers: true, section8Friendly: true, contact: { fullName: "David Chen", phone: "(718) 555-0303", email: "david@queensgateway.com", borough: "Queens", status: "ACTIVE", updatedAt: new Date(Date.now() - 86400000 * 2) }, properties: [{ id: "p4", status: "AVAILABLE" }, { id: "p5", status: "PENDING" }, { id: "p6", status: "OCCUPIED" }] },
  ] : landlords;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Landlords</h1>
          <p className="text-sm text-gray-500 mt-1">{mockLandlords.length} landlords in database</p>
        </div>
        <Link
          href="/contacts?type=LANDLORD&action=add"
          className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]"
        >
          <Plus className="w-4 h-4" /> Add Landlord
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-[#1a2b1a]">{mockLandlords.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Landlords</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-green-600">{mockLandlords.filter(l => l.acceptsVouchers).length}</p>
          <p className="text-xs text-gray-500 mt-1">Accept Vouchers</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-blue-600">{mockLandlords.reduce((sum, l) => sum + (l.properties?.length || 0), 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Properties</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Name / Company</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Contact</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Borough</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Portfolio</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Vouchers</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Properties</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockLandlords.map((landlord) => (
              <tr key={landlord.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-[#1a2b1a]">{landlord.contact.fullName}</p>
                    {landlord.companyName && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {landlord.companyName}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="space-y-0.5">
                    {landlord.contact.phone && (
                      <a href={`tel:${landlord.contact.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#4caf50]">
                        <Phone className="w-3 h-3" />{landlord.contact.phone}
                      </a>
                    )}
                    {landlord.contact.email && (
                      <a href={`mailto:${landlord.contact.email}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#4caf50]">
                        <Mail className="w-3 h-3" />{landlord.contact.email}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{landlord.contact.borough || "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{landlord.portfolioSize ? `${landlord.portfolioSize} units` : "—"}</td>
                <td className="px-5 py-3">
                  {landlord.acceptsVouchers ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <XCircle className="w-3.5 h-3.5" /> No
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{landlord.properties?.length || 0}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{formatDate(landlord.contact.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
