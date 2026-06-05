import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";

// Dashboard stats
export async function getDashboardStats() {
  const [
    totalContacts,
    activeTenants,
    availableProperties,
    openCases,
    criticalCases,
    overdueFollowUps,
    missingDocsTenants,
    housedThisMonth,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.tenant.count({ where: { tenantStatus: { not: "INACTIVE" } } }),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.housingCase.count({
      where: { status: { notIn: ["HOUSED", "CLOSED", "LOST"] } },
    }),
    prisma.housingCase.count({
      where: { priority: "CRITICAL", status: { notIn: ["HOUSED", "CLOSED", "LOST"] } },
    }),
    prisma.housingCase.count({
      where: {
        nextFollowUpDate: { lt: new Date() },
        status: { notIn: ["HOUSED", "CLOSED", "LOST"] },
      },
    }),
    prisma.tenant.count({ where: { documentsComplete: false, tenantStatus: { not: "INACTIVE" } } }),
    prisma.tenant.count({
      where: {
        tenantStatus: "HOUSED",
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    totalContacts,
    activeTenants,
    availableProperties,
    openCases,
    criticalCases,
    overdueFollowUps,
    missingDocsTenants,
    housedThisMonth,
  };
}

export async function getCasesByStatus() {
  return prisma.housingCase.groupBy({
    by: ["status"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
}

export async function getPropertiesByBorough() {
  return prisma.property.groupBy({
    by: ["borough"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
}

export async function getVoucherSizeDistribution() {
  return prisma.tenant.groupBy({
    by: ["voucherSize"],
    _count: { id: true },
    where: { voucherSize: { not: null } },
    orderBy: { voucherSize: "asc" },
  });
}

export async function getRecentActivity(limit = 20) {
  return prisma.activityLog.findMany({
    include: { actor: { select: { fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUpcomingTasks(limit = 10) {
  return prisma.task.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { gte: new Date() },
    },
    include: {
      assignedTo: { select: { fullName: true, avatarUrl: true } },
      relatedCase: { select: { caseNumber: true } },
      relatedContact: { select: { fullName: true } },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
  });
}

export async function getUrgentCases(limit = 10) {
  return prisma.housingCase.findMany({
    where: {
      priority: { in: ["HIGH", "CRITICAL"] },
      status: { notIn: ["HOUSED", "CLOSED", "LOST"] },
    },
    include: {
      tenant: {
        include: { contact: { select: { fullName: true } } },
      },
      assignedStaff: { select: { fullName: true } },
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "asc" }],
    take: limit,
  });
}

// Contacts queries
export async function getContacts(params: {
  search?: string;
  contactType?: string;
  status?: string;
  borough?: string;
  page?: number;
  limit?: number;
}) {
  const { search, contactType, status, borough, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ContactWhereInput = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { organization: { contains: search, mode: "insensitive" } },
    ];
  }
  if (contactType) where.contactType = contactType as never;
  if (status) where.status = status as never;
  if (borough) where.borough = borough;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        tenant: true,
        landlord: true,
        broker: true,
        caseworker: true,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contact.count({ where }),
  ]);

  return { contacts, total, pages: Math.ceil(total / limit) };
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      tenant: true,
      landlord: true,
      broker: true,
      caseworker: true,
      contactNotes: {
        include: { createdBy: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      contactTasks: {
        include: { assignedTo: { select: { fullName: true } } },
        orderBy: { dueDate: "asc" },
        take: 10,
      },
      contactDocs: {
        orderBy: { uploadedAt: "desc" },
        take: 20,
      },
      housingCases: {
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
    },
  });
}

// Tenants queries
export async function getTenants(params: {
  search?: string;
  status?: string;
  urgency?: string;
  borough?: string;
  voucherSize?: number;
  page?: number;
  limit?: number;
}) {
  const { search, status, urgency, borough, voucherSize, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.TenantWhereInput = {};
  if (search) {
    where.contact = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };
  }
  if (status) where.tenantStatus = status as never;
  if (urgency) where.urgencyLevel = urgency as never;
  if (borough) where.preferredBoroughs = { has: borough };
  if (voucherSize) where.voucherSize = voucherSize;

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        contact: true,
        assignedCaseworker: { include: { contact: true } },
      },
      orderBy: [{ urgencyLevel: "desc" }, { updatedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.tenant.count({ where }),
  ]);

  return { tenants, total, pages: Math.ceil(total / limit) };
}

export async function getTenantById(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: {
      contact: true,
      assignedCaseworker: { include: { contact: true } },
      housingCases: {
        include: {
          property: true,
          assignedStaff: { select: { fullName: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      tenantNotes: {
        include: { createdBy: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      tenantTasks: {
        include: { assignedTo: { select: { fullName: true } } },
        orderBy: { dueDate: "asc" },
        take: 10,
      },
      documents: { orderBy: { uploadedAt: "desc" }, take: 20 },
    },
  });
}

// Properties queries
export async function getProperties(params: {
  search?: string;
  status?: string;
  borough?: string;
  bedrooms?: number;
  minRent?: number;
  maxRent?: number;
  voucherAccepted?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, status, borough, bedrooms, minRent, maxRent, voucherAccepted, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {};
  if (search) {
    where.OR = [
      { address: { contains: search, mode: "insensitive" } },
      { neighborhood: { contains: search, mode: "insensitive" } },
      { propertyName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as never;
  if (borough) where.borough = borough;
  if (bedrooms !== undefined) where.bedrooms = bedrooms;
  if (voucherAccepted !== undefined) where.voucherAccepted = voucherAccepted;
  if (minRent || maxRent) {
    where.rent = {};
    if (minRent) where.rent.gte = minRent;
    if (maxRent) where.rent.lte = maxRent;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        landlord: { include: { contact: true } },
        broker: { include: { contact: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, pages: Math.ceil(total / limit) };
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      landlord: { include: { contact: true } },
      broker: { include: { contact: true } },
      housingCases: {
        include: {
          tenant: { include: { contact: true } },
          assignedStaff: { select: { fullName: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      propertyNotes: {
        include: { createdBy: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      documents: { orderBy: { uploadedAt: "desc" }, take: 20 },
    },
  });
}

// Housing Cases queries
export async function getHousingCases(params: {
  search?: string;
  status?: string;
  priority?: string;
  assignedStaffId?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, priority, assignedStaffId, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.HousingCaseWhereInput = {};
  if (search) {
    where.OR = [
      { caseNumber: { contains: search, mode: "insensitive" } },
      { caseSummary: { contains: search, mode: "insensitive" } },
      { tenant: { contact: { fullName: { contains: search, mode: "insensitive" } } } },
    ];
  }
  if (status) where.status = status as never;
  if (priority) where.priority = priority as never;
  if (assignedStaffId) where.assignedStaffId = assignedStaffId;

  const [cases, total] = await Promise.all([
    prisma.housingCase.findMany({
      where,
      include: {
        tenant: { include: { contact: true } },
        property: true,
        assignedStaff: { select: { fullName: true, avatarUrl: true } },
        caseworker: { include: { contact: true } },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.housingCase.count({ where }),
  ]);

  return { cases, total, pages: Math.ceil(total / limit) };
}

export async function getCaseById(id: string) {
  return prisma.housingCase.findUnique({
    where: { id },
    include: {
      tenant: { include: { contact: true } },
      property: { include: { landlord: { include: { contact: true } } } },
      landlord: { include: { contact: true } },
      broker: { include: { contact: true } },
      caseworker: { include: { contact: true } },
      assignedStaff: true,
      caseNotes: {
        include: { createdBy: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      caseTasks: {
        include: { assignedTo: { select: { fullName: true } } },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

// Tasks queries
export async function getTasks(params: {
  search?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  overdue?: boolean;
  today?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, status, priority, assignedToId, overdue, today, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (status) where.status = status as never;
  if (priority) where.priority = priority as never;
  if (assignedToId) where.assignedToId = assignedToId;
  if (overdue) {
    where.dueDate = { lt: new Date() };
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  }
  if (today) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    where.dueDate = { gte: todayStart, lte: todayEnd };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { fullName: true, avatarUrl: true } },
        relatedCase: { select: { caseNumber: true } },
        relatedContact: { select: { fullName: true } },
        relatedProperty: { select: { address: true, borough: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, pages: Math.ceil(total / limit) };
}

// Profiles queries
export async function getProfiles() {
  return prisma.profile.findMany({
    orderBy: { fullName: "asc" },
  });
}

// Documents queries
export async function getDocuments(params: {
  search?: string;
  documentType?: string;
  relatedEntityType?: string;
  page?: number;
  limit?: number;
}) {
  const { search, documentType, relatedEntityType, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (documentType) where.documentType = documentType;
  if (search) {
    where.fileName = { contains: search, mode: "insensitive" };
  }
  if (relatedEntityType === "case") where.relatedCaseId = { not: null };
  else if (relatedEntityType === "property") where.relatedPropertyId = { not: null };
  else if (relatedEntityType === "tenant") where.relatedTenantId = { not: null };
  else if (relatedEntityType === "contact") where.relatedContactId = { not: null };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        relatedCase: { select: { caseNumber: true } },
        relatedProperty: { select: { address: true, borough: true } },
        relatedContact: { select: { fullName: true } },
        relatedTenant: { include: { contact: { select: { fullName: true } } } },
      },
      orderBy: { uploadedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total, pages: Math.ceil(total / limit) };
}

// Matching tenants to properties
export async function getMatchingProperties(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return [];

  const where: Prisma.PropertyWhereInput = {
    status: "AVAILABLE",
    voucherAccepted: true,
  };

  if (tenant.voucherSize) where.bedrooms = tenant.voucherSize;
  if (tenant.maxRent) where.rent = { lte: tenant.maxRent };
  if (tenant.preferredBoroughs.length > 0) {
    where.borough = { in: tenant.preferredBoroughs };
  }

  return prisma.property.findMany({
    where,
    include: {
      landlord: { include: { contact: true } },
    },
    take: 20,
  });
}
