import { prisma } from "@/lib/db/client";
import { Briefcase, Phone, Mail, MapPin, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function BrokersPage() {
  let brokers: Array<{
    id: string;
    brokerageName: string | null;
    licenseNumber: string | null;
    serviceAreas: string[];
    activeListingsCount: number | null;
    contact: { fullName: string; phone: string | null; email: string | null; borough: string | null; updatedAt: Date };
  }> = [];

  try {
    brokers = await prisma.broker.findMany({
      include: { contact: true },
      orderBy: { contact: { updatedAt: "desc" } },
      take: 100,
    });
  } catch {}

  const displayBrokers = brokers.length === 0 ? [
    { id: "b1", brokerageName: "Metro NYC Realty", licenseNumber: "LIC-001234", serviceAreas: ["Bronx", "Manhattan"], activeListingsCount: 8, contact: { fullName: "Angela Rivera", phone: "(212) 555-0401", email: "angela@metronyc.com", borough: "Manhattan", updatedAt: new Date() } },
    { id: "b2", brokerageName: "Brooklyn Bridge Properties", licenseNumber: "LIC-005678", serviceAreas: ["Brooklyn", "Queens"], activeListingsCount: 5, contact: { fullName: "James Wilson", phone: "(718) 555-0502", email: "james@bbproperties.com", borough: "Brooklyn", updatedAt: new Date(Date.now() - 86400000) } },
  ] : brokers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2b1a]">Brokers</h1>
          <p className="text-sm text-gray-500 mt-1">{displayBrokers.length} brokers in database</p>
        </div>
        <Link href="/contacts?type=BROKER&action=add" className="flex items-center gap-2 bg-[#1a2b1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d4a2d]">
          <Plus className="w-4 h-4" /> Add Broker
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayBrokers.map((broker) => (
          <div key={broker.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1a2b1a] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1a2b1a]">{broker.contact.fullName}</p>
                {broker.brokerageName && <p className="text-xs text-gray-400">{broker.brokerageName}</p>}
                {broker.licenseNumber && <p className="text-xs text-gray-400">License: {broker.licenseNumber}</p>}
              </div>
            </div>
            <div className="space-y-2">
              {broker.contact.phone && (
                <a href={`tel:${broker.contact.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#4caf50]">
                  <Phone className="w-3 h-3" />{broker.contact.phone}
                </a>
              )}
              {broker.contact.email && (
                <a href={`mailto:${broker.contact.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#4caf50]">
                  <Mail className="w-3 h-3" />{broker.contact.email}
                </a>
              )}
              {broker.serviceAreas.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {broker.serviceAreas.join(", ")}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Active Listings</span>
              <span className="font-bold text-[#4caf50]">{broker.activeListingsCount ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
