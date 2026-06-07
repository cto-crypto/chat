"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { NYC_BOROUGHS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ContactFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  contactType: z.enum(["TENANT", "LANDLORD", "BROKER", "CASEWORKER", "OTHER"]),
  phone: z.string().optional().or(z.literal("")),
  alternatePhone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  borough: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  organization: z.string().optional().or(z.literal("")),
  preferredContactMethod: z.string().optional().or(z.literal("")),
  status: z
    .enum(["NEW", "ACTIVE", "INACTIVE", "FOLLOW_UP_NEEDED", "ARCHIVED"])
    .default("NEW"),
  source: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactDialog({ open, onOpenChange }: AddContactDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      contactType: "TENANT",
      status: "NEW",
    },
  });

  const contactType = watch("contactType");
  const status = watch("status");
  const borough = watch("borough");
  const preferredContactMethod = watch("preferredContactMethod");

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const body: Record<string, unknown> = {
        fullName: data.fullName,
        contactType: data.contactType,
        status: data.status,
      };
      if (data.phone) body.phone = data.phone;
      if (data.alternatePhone) body.alternatePhone = data.alternatePhone;
      if (data.email) body.email = data.email;
      if (data.address) body.address = data.address;
      if (data.borough) body.borough = data.borough;
      if (data.neighborhood) body.neighborhood = data.neighborhood;
      if (data.organization) body.organization = data.organization;
      if (data.preferredContactMethod) body.preferredContactMethod = data.preferredContactMethod;
      if (data.source) body.source = data.source;
      if (data.notes) body.notes = data.notes;

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create contact");
      }

      const contact = await res.json();
      reset();
      onOpenChange(false);
      router.push(`/contacts/${contact.id}`);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      setServerError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-[#1a2b1a]">
            Add New Contact
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-6 py-4 space-y-5">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Core Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Jane Smith"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-400" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Contact Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={contactType}
                  onValueChange={(v) => setValue("contactType", v as ContactFormData["contactType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TENANT">Tenant</SelectItem>
                    <SelectItem value="LANDLORD">Landlord</SelectItem>
                    <SelectItem value="BROKER">Broker</SelectItem>
                    <SelectItem value="CASEWORKER">Caseworker</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(718) 555-0123"
                  {...register("phone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alternatePhone" className="text-sm font-medium">
                  Alternate Phone
                </Label>
                <Input
                  id="alternatePhone"
                  type="tel"
                  placeholder="(718) 555-0124"
                  {...register("alternatePhone")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, Apt 4B"
                {...register("address")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Borough</Label>
                <Select
                  value={borough ?? ""}
                  onValueChange={(v) => setValue("borough", v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select borough" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {NYC_BOROUGHS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood" className="text-sm font-medium">
                  Neighborhood
                </Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g. Bed-Stuy"
                  {...register("neighborhood")}
                />
              </div>
            </div>

            <Separator />

            {/* Organization & Contact Prefs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="organization" className="text-sm font-medium">
                  Organization
                </Label>
                <Input
                  id="organization"
                  placeholder="Company / Agency name"
                  {...register("organization")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Preferred Contact Method</Label>
                <Select
                  value={preferredContactMethod ?? ""}
                  onValueChange={(v) => setValue("preferredContactMethod", v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None specified</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text / SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setValue("status", v as ContactFormData["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="FOLLOW_UP_NEEDED">Follow Up Needed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source" className="text-sm font-medium">Source</Label>
                <Input
                  id="source"
                  placeholder="e.g. Referral, Walk-in"
                  {...register("source")}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any additional notes about this contact..."
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("notes")}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#1a2b1a] hover:bg-[#2a3b2a] text-white min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add Contact"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
