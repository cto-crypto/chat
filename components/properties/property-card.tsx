"use client";

import { useRouter } from "next/navigation";
import { Home, CheckCircle2, User, MapPin, BedDouble, Bath, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatPropertyStatus, PROPERTY_STATUS_COLORS } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    address: string;
    borough: string;
    neighborhood?: string | null;
    bedrooms: number;
    bathrooms?: number | string | null;
    rent: number | string;
    status: string;
    voucherAccepted: boolean;
    landlord?: {
      contact: {
        fullName: string;
      };
    } | null;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
      onClick={() => router.push(`/properties/${property.id}`)}
    >
      {/* Photo placeholder */}
      <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-gray-500 transition-colors">
          <Home className="h-12 w-12" />
          <span className="text-xs font-medium">No Photo</span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              PROPERTY_STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-700"
            )}
          >
            {formatPropertyStatus(property.status)}
          </span>
        </div>
        {property.voucherAccepted && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              Voucher OK
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {property.address}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span>
            {property.borough}
            {property.neighborhood ? ` · ${property.neighborhood}` : ""}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-gray-400" />
              {property.bedrooms} bd
            </span>
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-gray-400" />
                {Number(property.bathrooms)} ba
              </span>
            )}
          </div>
          <span className="flex items-center gap-0.5 font-semibold text-gray-900">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            {formatCurrency(Number(property.rent))}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </span>
        </div>

        {property.landlord && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-500">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{property.landlord.contact.fullName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
