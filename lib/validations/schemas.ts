import { z } from "zod";

export const ContactSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(200),
  contactType: z.enum(["TENANT", "LANDLORD", "BROKER", "CASEWORKER", "OTHER"]),
  phone: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  borough: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  preferredContactMethod: z.string().optional().nullable(),
  status: z.enum(["NEW", "ACTIVE", "INACTIVE", "FOLLOW_UP_NEEDED", "ARCHIVED"]).default("NEW"),
  tags: z.array(z.string()).default([]),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const TenantSchema = z.object({
  voucherType: z.string().optional().nullable(),
  voucherSize: z.coerce.number().int().min(1).max(8).optional().nullable(),
  voucherNumber: z.string().optional().nullable(),
  householdSize: z.coerce.number().int().min(1).optional().nullable(),
  maxRent: z.coerce.number().positive().optional().nullable(),
  preferredBoroughs: z.array(z.string()).default([]),
  preferredNeighborhoods: z.array(z.string()).default([]),
  accessibilityNeeds: z.string().optional().nullable(),
  pets: z.boolean().default(false),
  moveInDeadline: z.string().optional().nullable(),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  tenantStatus: z.enum(["NEW", "SEARCHING", "VIEWING", "APPLICATION_SUBMITTED", "INSPECTION_PENDING", "APPROVED", "HOUSED", "INACTIVE"]).default("NEW"),
  documentsComplete: z.boolean().default(false),
  missingDocuments: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

export const PropertySchema = z.object({
  propertyName: z.string().optional().nullable(),
  address: z.string().min(1, "Address is required"),
  borough: z.string().min(1, "Borough is required"),
  neighborhood: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20).optional().nullable(),
  rent: z.coerce.number().positive("Rent must be positive"),
  securityDeposit: z.coerce.number().optional().nullable(),
  voucherAccepted: z.boolean().default(false),
  voucherTypesAccepted: z.array(z.string()).default([]),
  status: z.enum(["AVAILABLE", "PENDING", "INSPECTION_SCHEDULED", "APPROVED", "OCCUPIED", "UNAVAILABLE"]).default("AVAILABLE"),
  availabilityDate: z.string().optional().nullable(),
  utilitiesIncluded: z.array(z.string()).default([]),
  petPolicy: z.string().optional().nullable(),
  accessibilityFeatures: z.array(z.string()).default([]),
  elevator: z.boolean().default(false),
  laundry: z.boolean().default(false),
  parking: z.boolean().default(false),
  description: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  landlordId: z.string().optional().nullable(),
  brokerId: z.string().optional().nullable(),
});

export const HousingCaseSchema = z.object({
  tenantId: z.string().optional().nullable(),
  propertyId: z.string().optional().nullable(),
  landlordId: z.string().optional().nullable(),
  brokerId: z.string().optional().nullable(),
  caseworkerId: z.string().optional().nullable(),
  assignedStaffId: z.string().optional().nullable(),
  status: z.enum(["NEW", "SEARCHING", "VIEWING_SCHEDULED", "APPLICATION_STARTED", "DOCUMENTS_NEEDED", "INSPECTION_PENDING", "APPROVED", "LEASE_SIGNING", "HOUSED", "CLOSED", "LOST"]).default("NEW"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  moveInTargetDate: z.string().optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
  caseSummary: z.string().optional().nullable(),
  blockers: z.string().optional().nullable(),
});

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional().nullable(),
  relatedContactId: z.string().optional().nullable(),
  relatedTenantId: z.string().optional().nullable(),
  relatedPropertyId: z.string().optional().nullable(),
  relatedCaseId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  reminderEnabled: z.boolean().default(false),
});

export const NoteSchema = z.object({
  note: z.string().min(1, "Note is required").max(10000),
  noteType: z.enum(["GENERAL", "CALL", "EMAIL", "MEETING", "SYSTEM", "STATUS_UPDATE"]).default("GENERAL"),
  relatedContactId: z.string().optional().nullable(),
  relatedTenantId: z.string().optional().nullable(),
  relatedPropertyId: z.string().optional().nullable(),
  relatedCaseId: z.string().optional().nullable(),
});

export type ContactInput = z.infer<typeof ContactSchema>;
export type TenantInput = z.infer<typeof TenantSchema>;
export type PropertyInput = z.infer<typeof PropertySchema>;
export type HousingCaseInput = z.infer<typeof HousingCaseSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
export type NoteInput = z.infer<typeof NoteSchema>;
