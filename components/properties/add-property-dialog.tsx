"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronRight, ChevronLeft, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PropertySchema, type PropertyInput } from "@/lib/validations/schemas";
import { NYC_BOROUGHS, VOUCHER_TYPES, cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Features" },
  { id: 3, label: "Details" },
  { id: 4, label: "Done" },
];

export function AddPropertyDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      voucherAccepted: false,
      elevator: false,
      laundry: false,
      parking: false,
      status: "AVAILABLE",
      voucherTypesAccepted: [],
      utilitiesIncluded: [],
      accessibilityFeatures: [],
    },
  });

  const voucherAccepted = watch("voucherAccepted");
  const elevator = watch("elevator");
  const laundry = watch("laundry");
  const parking = watch("parking");
  const borough = watch("borough");

  async function onSubmit(data: PropertyInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStep(4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStep(1);
      reset();
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 my-2">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step > s.id
                    ? "bg-[#4caf50] text-white"
                    : step === s.id
                    ? "bg-[#1a2b1a] text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  step === s.id ? "text-[#1a2b1a]" : "text-gray-400"
                )}
              >
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={cn("h-px w-6 bg-gray-200", step > s.id && "bg-[#4caf50]")} />
              )}
            </div>
          ))}
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Apt 4B"
                    {...register("address")}
                    className={errors.address ? "border-red-400" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>
                      Borough <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(v) => setValue("borough", v)} value={borough}>
                      <SelectTrigger className={errors.borough ? "border-red-400" : ""}>
                        <SelectValue placeholder="Select borough" />
                      </SelectTrigger>
                      <SelectContent>
                        {NYC_BOROUGHS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.borough && (
                      <p className="text-xs text-red-500">{errors.borough.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input
                      id="neighborhood"
                      placeholder="e.g. Bed-Stuy"
                      {...register("neighborhood")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" placeholder="10001" {...register("zipCode")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      onValueChange={(v) => setValue("status", v as PropertyInput["status"])}
                      defaultValue="AVAILABLE"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="INSPECTION_SCHEDULED">Inspection Scheduled</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="OCCUPIED">Occupied</SelectItem>
                        <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bedrooms">
                      Bedrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min={0}
                      {...register("bedrooms")}
                      className={errors.bedrooms ? "border-red-400" : ""}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min={0}
                      step="0.5"
                      {...register("bathrooms")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rent">
                      Monthly Rent <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rent"
                      type="number"
                      min={0}
                      placeholder="2500"
                      {...register("rent")}
                      className={errors.rent ? "border-red-400" : ""}
                    />
                    {errors.rent && (
                      <p className="text-xs text-red-500">{errors.rent.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    min={0}
                    placeholder="5000"
                    {...register("securityDeposit")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Voucher Accepted</p>
                  <p className="text-xs text-gray-500">
                    Accept housing vouchers (Section 8, CityFHEPS, etc.)
                  </p>
                </div>
                <Switch
                  checked={voucherAccepted}
                  onCheckedChange={(v) => setValue("voucherAccepted", v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Elevator Building</p>
                  <p className="text-xs text-gray-500">Building has elevator access</p>
                </div>
                <Switch
                  checked={elevator}
                  onCheckedChange={(v) => setValue("elevator", v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Laundry</p>
                  <p className="text-xs text-gray-500">In-unit or on-site laundry</p>
                </div>
                <Switch
                  checked={laundry}
                  onCheckedChange={(v) => setValue("laundry", v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Parking Available</p>
                  <p className="text-xs text-gray-500">Parking spot available</p>
                </div>
                <Switch
                  checked={parking}
                  onCheckedChange={(v) => setValue("parking", v)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="petPolicy">Pet Policy</Label>
                <Input
                  id="petPolicy"
                  placeholder="e.g. No pets, Cats only, Small dogs OK"
                  {...register("petPolicy")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="availabilityDate">Availability Date</Label>
                <Input
                  id="availabilityDate"
                  type="date"
                  {...register("availabilityDate")}
                />
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="propertyName">Property Name (optional)</Label>
                <Input
                  id="propertyName"
                  placeholder="e.g. The Madison Arms"
                  {...register("propertyName")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Describe the property..."
                  {...register("description")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <textarea
                  id="internalNotes"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Internal notes (not visible to tenants)..."
                  {...register("internalNotes")}
                />
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-lg">Property Added!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  The property has been successfully added to the system.
                </p>
              </div>
              <Button onClick={handleClose} className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white">
                Close
              </Button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#4caf50] hover:bg-[#43a047] text-white"
                >
                  {submitting ? "Saving…" : "Save Property"}
                </Button>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
