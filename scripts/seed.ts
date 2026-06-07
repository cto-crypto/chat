import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NYC_BOROUGHS = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
const VOUCHER_TYPES = ["Section 8", "HCV", "HASA", "CityFHEPS", "FHEPS", "LINC"];

async function main() {
  console.log("🌱 Seeding KeevOS database...");

  // Create a demo profile (normally created via auth trigger)
  const adminProfile = await prisma.profile.upsert({
    where: { email: "admin@keevhousing.com" },
    update: {},
    create: {
      authUserId: "00000000-0000-0000-0000-000000000001",
      fullName: "Keev Admin",
      email: "admin@keevhousing.com",
      role: "OWNER",
      phone: "(212) 555-0001",
      status: "active",
    },
  });

  const staffProfile = await prisma.profile.upsert({
    where: { email: "staff@keevhousing.com" },
    update: {},
    create: {
      authUserId: "00000000-0000-0000-0000-000000000002",
      fullName: "Sarah Johnson",
      email: "staff@keevhousing.com",
      role: "STAFF",
      phone: "(212) 555-0002",
      status: "active",
    },
  });

  const managerProfile = await prisma.profile.upsert({
    where: { email: "manager@keevhousing.com" },
    update: {},
    create: {
      authUserId: "00000000-0000-0000-0000-000000000003",
      fullName: "Mike Torres",
      email: "manager@keevhousing.com",
      role: "MANAGER",
      phone: "(212) 555-0003",
      status: "active",
    },
  });

  console.log("✓ Profiles created");

  // Create Caseworker contacts
  const caseworkerContacts = await Promise.all([
    prisma.contact.create({
      data: {
        fullName: "Patricia Williams",
        contactType: "CASEWORKER",
        phone: "(212) 555-0601",
        email: "p.williams@hra.nyc.gov",
        organization: "NYC HRA",
        borough: "Manhattan",
        status: "ACTIVE",
        createdById: adminProfile.id,
      },
    }),
    prisma.contact.create({
      data: {
        fullName: "Carlos Rodriguez",
        contactType: "CASEWORKER",
        phone: "(718) 555-0702",
        email: "crodriguez@bronxworks.org",
        organization: "BronxWorks",
        borough: "Bronx",
        status: "ACTIVE",
        createdById: adminProfile.id,
      },
    }),
    prisma.contact.create({
      data: {
        fullName: "Jennifer Lee",
        contactType: "CASEWORKER",
        phone: "(347) 555-0803",
        email: "jlee@bkcs.org",
        organization: "Brooklyn Community Services",
        borough: "Brooklyn",
        status: "ACTIVE",
        createdById: adminProfile.id,
      },
    }),
  ]);

  const caseworkers = await Promise.all(caseworkerContacts.map((c, i) =>
    prisma.caseworker.create({
      data: {
        contactId: c.id,
        agencyName: [c.organization][0] || null,
        caseloadCount: [45, 32, 28][i],
        specialization: ["Section 8 Housing", "Homeless Prevention", "Family Housing"][i],
      },
    })
  ));

  console.log("✓ Caseworkers created");

  // Create Landlord contacts
  const landlordContacts = await Promise.all([
    { name: "Robert Martinez", company: "Bronx Realty Holdings", phone: "(718) 555-0101", email: "robert@bronxrealty.com", borough: "Bronx", portfolio: 45, vouchers: true },
    { name: "Susan Park", company: "Brooklyn Heights Properties", phone: "(347) 555-0202", email: "susan@bhproperties.com", borough: "Brooklyn", portfolio: 28, vouchers: false },
    { name: "David Chen", company: "Queens Gateway LLC", phone: "(718) 555-0303", email: "david@queensgateway.com", borough: "Queens", portfolio: 12, vouchers: true },
    { name: "Maria Gonzalez", company: "South Bronx Housing", phone: "(718) 555-0404", email: "maria@sbhousing.com", borough: "Bronx", portfolio: 8, vouchers: true },
    { name: "Frank Thompson", company: "Manhattan Affordable", phone: "(212) 555-0505", email: "frank@mahousing.com", borough: "Manhattan", portfolio: 5, vouchers: true },
  ].map(l => prisma.contact.create({
    data: {
      fullName: l.name,
      contactType: "LANDLORD",
      phone: l.phone,
      email: l.email,
      organization: l.company,
      borough: l.borough,
      status: "ACTIVE",
      createdById: adminProfile.id,
    },
  })));

  const landlords = await Promise.all(landlordContacts.map((c, i) => {
    const data = [
      { company: "Bronx Realty Holdings", portfolio: 45, vouchers: true },
      { company: "Brooklyn Heights Properties", portfolio: 28, vouchers: false },
      { company: "Queens Gateway LLC", portfolio: 12, vouchers: true },
      { company: "South Bronx Housing", portfolio: 8, vouchers: true },
      { company: "Manhattan Affordable", portfolio: 5, vouchers: true },
    ][i];
    return prisma.landlord.create({
      data: {
        contactId: c.id,
        companyName: data.company,
        portfolioSize: data.portfolio,
        acceptsVouchers: data.vouchers,
        section8Friendly: data.vouchers,
      },
    });
  }));

  console.log("✓ Landlords created");

  // Create Broker contacts
  const brokerContacts = await Promise.all([
    { name: "Angela Rivera", brokerage: "Metro NYC Realty", license: "LIC-001234", phone: "(212) 555-0401", email: "angela@metronyc.com", areas: ["Bronx", "Manhattan"] },
    { name: "James Wilson", brokerage: "Brooklyn Bridge Properties", license: "LIC-005678", phone: "(718) 555-0502", email: "james@bbproperties.com", areas: ["Brooklyn", "Queens"] },
    { name: "Michelle Santos", brokerage: "Queens Affordable Housing", license: "LIC-009012", phone: "(718) 555-0603", email: "michelle@qahousing.com", areas: ["Queens"] },
  ].map(b => prisma.contact.create({
    data: {
      fullName: b.name,
      contactType: "BROKER",
      phone: b.phone,
      email: b.email,
      organization: b.brokerage,
      status: "ACTIVE",
      createdById: adminProfile.id,
    },
  })));

  const brokers = await Promise.all(brokerContacts.map((c, i) => {
    const data = [
      { brokerage: "Metro NYC Realty", license: "LIC-001234", areas: ["Bronx", "Manhattan"], listings: 8 },
      { brokerage: "Brooklyn Bridge Properties", license: "LIC-005678", areas: ["Brooklyn", "Queens"], listings: 5 },
      { brokerage: "Queens Affordable Housing", license: "LIC-009012", areas: ["Queens"], listings: 3 },
    ][i];
    return prisma.broker.create({
      data: {
        contactId: c.id,
        brokerageName: data.brokerage,
        licenseNumber: data.license,
        serviceAreas: data.areas,
        activeListingsCount: data.listings,
      },
    });
  }));

  console.log("✓ Brokers created");

  // Create Properties
  const propertyData = [
    { address: "145 E 149th St, Apt 3B", borough: "Bronx", neighborhood: "South Bronx", beds: 2, rent: 1800, voucher: true, status: "AVAILABLE" as const, landlordIdx: 0 },
    { address: "420 Myrtle Ave, Apt 2F", borough: "Brooklyn", neighborhood: "Bed-Stuy", beds: 3, rent: 2200, voucher: true, status: "AVAILABLE" as const, landlordIdx: 1 },
    { address: "89-14 Queens Blvd, Apt 5A", borough: "Queens", neighborhood: "Elmhurst", beds: 2, rent: 1950, voucher: true, status: "AVAILABLE" as const, landlordIdx: 2 },
    { address: "2350 Grand Concourse, Apt 1C", borough: "Bronx", neighborhood: "Fordham", beds: 1, rent: 1400, voucher: true, status: "AVAILABLE" as const, landlordIdx: 0 },
    { address: "567 Atlantic Ave, Apt 4D", borough: "Brooklyn", neighborhood: "Boerum Hill", beds: 2, rent: 2400, voucher: false, status: "AVAILABLE" as const, landlordIdx: 1 },
    { address: "45-12 Parsons Blvd, Apt 2B", borough: "Queens", neighborhood: "Flushing", beds: 3, rent: 2100, voucher: true, status: "PENDING" as const, landlordIdx: 2 },
    { address: "180 Cabrini Blvd, Apt 6E", borough: "Manhattan", neighborhood: "Washington Heights", beds: 2, rent: 2600, voucher: true, status: "AVAILABLE" as const, landlordIdx: 4 },
    { address: "350 E Tremont Ave, Apt 1A", borough: "Bronx", neighborhood: "Tremont", beds: 4, rent: 2400, voucher: true, status: "AVAILABLE" as const, landlordIdx: 3 },
    { address: "774 Flatbush Ave, Apt 3C", borough: "Brooklyn", neighborhood: "Flatbush", beds: 2, rent: 1900, voucher: true, status: "OCCUPIED" as const, landlordIdx: 1 },
    { address: "37-50 82nd St, Apt 2A", borough: "Queens", neighborhood: "Jackson Heights", beds: 1, rent: 1600, voucher: true, status: "AVAILABLE" as const, landlordIdx: 2 },
    { address: "555 Morris Ave, Apt 5B", borough: "Bronx", neighborhood: "Morrisania", beds: 3, rent: 1950, voucher: true, status: "INSPECTION_SCHEDULED" as const, landlordIdx: 0 },
    { address: "123 Rogers Ave, Apt 1E", borough: "Brooklyn", neighborhood: "Crown Heights", beds: 2, rent: 2000, voucher: true, status: "AVAILABLE" as const, landlordIdx: 1 },
  ];

  const properties = await Promise.all(propertyData.map(p =>
    prisma.property.create({
      data: {
        address: p.address,
        borough: p.borough,
        neighborhood: p.neighborhood,
        bedrooms: p.beds,
        rent: p.rent,
        bathrooms: 1,
        voucherAccepted: p.voucher,
        status: p.status,
        landlordId: landlords[p.landlordIdx].id,
        brokerId: p.landlordIdx < 3 ? brokers[p.landlordIdx % 3].id : null,
        elevator: Math.random() > 0.5,
        laundry: Math.random() > 0.3,
        parking: Math.random() > 0.7,
      },
    })
  ));

  console.log("✓ Properties created");

  // Create Tenant contacts
  const tenantData = [
    { name: "Maria Santos", phone: "(718) 555-1001", email: "maria.santos@email.com", borough: "Bronx", voucher: "Section 8", vSize: 2, maxRent: 2000, urgency: "HIGH" as const, status: "SEARCHING" as const },
    { name: "James Thompson", phone: "(347) 555-1002", email: "james.t@email.com", borough: "Brooklyn", voucher: "CityFHEPS", vSize: 3, maxRent: 2300, urgency: "CRITICAL" as const, status: "VIEWING" as const },
    { name: "Rosa Martinez", phone: "(718) 555-1003", email: "rosa.m@email.com", borough: "Queens", voucher: "HCV", vSize: 2, maxRent: 1900, urgency: "MEDIUM" as const, status: "NEW" as const },
    { name: "Antoine Williams", phone: "(212) 555-1004", email: "awilliams@email.com", borough: "Bronx", voucher: "FHEPS", vSize: 1, maxRent: 1500, urgency: "HIGH" as const, status: "SEARCHING" as const },
    { name: "Diana Chen", phone: "(718) 555-1005", email: "diana.c@email.com", borough: "Manhattan", voucher: "Section 8", vSize: 2, maxRent: 2500, urgency: "LOW" as const, status: "APPLICATION_SUBMITTED" as const },
    { name: "Carlos Rivera", phone: "(347) 555-1006", email: "crivera@email.com", borough: "Bronx", voucher: "HASA", vSize: 3, maxRent: 2200, urgency: "CRITICAL" as const, status: "INSPECTION_PENDING" as const },
    { name: "Latoya Jackson", phone: "(718) 555-1007", email: "latoya.j@email.com", borough: "Brooklyn", voucher: "CityFHEPS", vSize: 2, maxRent: 2100, urgency: "HIGH" as const, status: "SEARCHING" as const },
    { name: "Michael Park", phone: "(212) 555-1008", email: "mpark@email.com", borough: "Queens", voucher: "Section 8", vSize: 1, maxRent: 1700, urgency: "MEDIUM" as const, status: "NEW" as const },
    { name: "Yolanda Cruz", phone: "(718) 555-1009", email: "ycruz@email.com", borough: "Bronx", voucher: "LINC", vSize: 4, maxRent: 2500, urgency: "HIGH" as const, status: "VIEWING" as const },
    { name: "Marcus Johnson", phone: "(347) 555-1010", email: "mjohnson@email.com", borough: "Brooklyn", voucher: "HCV", vSize: 2, maxRent: 2000, urgency: "MEDIUM" as const, status: "HOUSED" as const },
    { name: "Sofia Reyes", phone: "(718) 555-1011", email: "sreyes@email.com", borough: "Queens", voucher: "Section 8", vSize: 2, maxRent: 1950, urgency: "CRITICAL" as const, status: "SEARCHING" as const },
    { name: "Kevin Brown", phone: "(212) 555-1012", email: "kbrown@email.com", borough: "Manhattan", voucher: "FHEPS", vSize: 1, maxRent: 1600, urgency: "LOW" as const, status: "NEW" as const },
    { name: "Amara Diallo", phone: "(718) 555-1013", email: "adiallo@email.com", borough: "Bronx", voucher: "CityFHEPS", vSize: 3, maxRent: 2100, urgency: "HIGH" as const, status: "APPROVED" as const },
    { name: "Robert Lee", phone: "(347) 555-1014", email: "rlee@email.com", borough: "Brooklyn", voucher: "Section 8", vSize: 2, maxRent: 2000, urgency: "MEDIUM" as const, status: "SEARCHING" as const },
    { name: "Nina Patel", phone: "(718) 555-1015", email: "npatel@email.com", borough: "Queens", voucher: "HCV", vSize: 2, maxRent: 2100, urgency: "LOW" as const, status: "NEW" as const },
  ];

  const tenantContacts = await Promise.all(tenantData.map(t =>
    prisma.contact.create({
      data: {
        fullName: t.name,
        contactType: "TENANT",
        phone: t.phone,
        email: t.email,
        borough: t.borough,
        status: "ACTIVE",
        createdById: staffProfile.id,
      },
    })
  ));

  const tenants = await Promise.all(tenantContacts.map((c, i) => {
    const t = tenantData[i];
    return prisma.tenant.create({
      data: {
        contactId: c.id,
        voucherType: t.voucher,
        voucherSize: t.vSize,
        householdSize: t.vSize + 1,
        maxRent: t.maxRent,
        preferredBoroughs: [t.borough],
        urgencyLevel: t.urgency,
        tenantStatus: t.status,
        assignedCaseworkerId: caseworkers[i % caseworkers.length].id,
        documentsComplete: t.status === "HOUSED" || t.status === "APPROVED",
        missingDocuments: t.status === "HOUSED" ? [] : ["Government ID", "Proof of Income"],
        pets: Math.random() > 0.7,
      },
    });
  }));

  console.log("✓ Tenants created");

  // Create Housing Cases
  const caseStatuses = ["NEW", "SEARCHING", "VIEWING_SCHEDULED", "APPLICATION_STARTED", "DOCUMENTS_NEEDED", "INSPECTION_PENDING", "APPROVED", "LEASE_SIGNING", "HOUSED", "CLOSED"] as const;
  const casePriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

  const cases = await Promise.all(tenants.slice(0, 10).map((tenant, i) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const caseNum = `KOS-${year}-${String(i + 1).padStart(5, "0")}`;
    return prisma.housingCase.create({
      data: {
        caseNumber: caseNum,
        tenantId: tenant.id,
        propertyId: i < properties.length ? properties[i % properties.length].id : null,
        landlordId: landlords[i % landlords.length].id,
        brokerId: brokers[i % brokers.length].id,
        caseworkerId: caseworkers[i % caseworkers.length].id,
        assignedStaffId: i % 2 === 0 ? staffProfile.id : managerProfile.id,
        status: caseStatuses[i % caseStatuses.length],
        priority: casePriorities[i % casePriorities.length],
        moveInTargetDate: new Date(Date.now() + 86400000 * (30 + i * 7)),
        nextFollowUpDate: new Date(Date.now() + 86400000 * (i * 2)),
        caseSummary: `Housing search case for ${tenantContacts[i].fullName}. ${tenant.voucherType} voucher, seeking ${tenant.voucherSize}BR in ${tenant.preferredBoroughs.join(", ")}.`,
        blockers: i % 4 === 0 ? "Missing proof of income documentation" : null,
        contactId: tenantContacts[i].id,
      },
    });
  }));

  console.log("✓ Housing cases created");

  // Create Tasks
  const taskTitles = [
    "Follow up with tenant about missing documents",
    "Schedule property inspection",
    "Contact landlord about availability",
    "Submit housing application",
    "Review lease agreement",
    "Coordinate move-in logistics",
    "Collect proof of income",
    "Verify voucher amount",
    "Schedule viewing appointment",
    "Send welcome packet to tenant",
  ];

  await Promise.all(taskTitles.map((title, i) =>
    prisma.task.create({
      data: {
        title,
        description: `Task for housing placement operation - ${title.toLowerCase()}`,
        assignedToId: i % 2 === 0 ? staffProfile.id : managerProfile.id,
        relatedCaseId: cases[i % cases.length].id,
        dueDate: new Date(Date.now() + 86400000 * (i - 2)),
        status: i < 3 ? "OVERDUE" : i < 6 ? "IN_PROGRESS" : "PENDING",
        priority: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][i % 4] as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        createdById: adminProfile.id,
      },
    })
  ));

  console.log("✓ Tasks created");

  // Create Notes
  const noteTexts = [
    "Called tenant - voicemail left. Will try again tomorrow.",
    "Met with landlord. Property is in good condition. Landlord is flexible on move-in date.",
    "Tenant submitted all required documents today.",
    "Inspection passed with minor repairs needed. Landlord agreed to fix before move-in.",
    "Case approved! Lease signing scheduled for next week.",
    "Tenant expressed concern about commute to work. Reviewing alternative properties.",
    "Follow-up email sent to caseworker regarding missing documentation.",
    "Property viewing went well. Tenant is very interested.",
  ];

  await Promise.all(noteTexts.map((note, i) =>
    prisma.note.create({
      data: {
        note,
        noteType: (["CALL", "MEETING", "STATUS_UPDATE", "MEETING", "STATUS_UPDATE", "GENERAL", "EMAIL", "MEETING"] as const)[i],
        relatedCaseId: cases[i % cases.length].id,
        relatedTenantId: tenants[i % tenants.length].id,
        createdById: i % 2 === 0 ? staffProfile.id : managerProfile.id,
      },
    })
  ));

  console.log("✓ Notes created");

  // Create Document metadata
  const docTypes = ["VOUCHER", "ID", "LEASE", "INSPECTION", "APPLICATION", "INCOME_PROOF"] as const;
  await Promise.all(tenants.slice(0, 8).map((tenant, i) =>
    prisma.document.create({
      data: {
        fileName: `${["voucher", "id-document", "lease-draft", "inspection-report", "application-form", "pay-stub"][i % 6]}.pdf`,
        fileUrl: `https://storage.example.com/keevos/${tenant.id}/${Date.now()}.pdf`,
        fileType: "application/pdf",
        fileSize: 1024 * (50 + i * 25),
        documentType: docTypes[i % docTypes.length],
        relatedTenantId: tenant.id,
        relatedCaseId: cases[i % cases.length].id,
        uploadedById: staffProfile.id,
      },
    })
  ));

  console.log("✓ Documents created");

  // Create Activity Logs
  const actions = ["contact.created", "tenant.created", "case.created", "case.status_changed", "document.uploaded", "task.created", "task.completed"];
  await Promise.all([...Array(20)].map((_, i) =>
    prisma.activityLog.create({
      data: {
        actorId: i % 3 === 0 ? adminProfile.id : i % 2 === 0 ? staffProfile.id : managerProfile.id,
        action: actions[i % actions.length],
        entityType: ["contact", "tenant", "housing_case", "housing_case", "document", "task", "task"][i % 7],
        entityId: cases[i % cases.length].id,
        newValues: { status: "updated", timestamp: new Date().toISOString() },
        ipAddress: "192.168.1.1",
      },
    })
  ));

  console.log("✓ Activity logs created");

  // Create some automation rules
  const automationRules = [
    { name: "Documents Needed → Create Follow-up Task", triggerType: "case.status_changed", conditions: { status: "DOCUMENTS_NEEDED" }, actions: { type: "create_task", title: "Collect missing documents" }, isActive: true },
    { name: "Overdue Task → Update Status", triggerType: "task.due_date_passed", conditions: { status: ["PENDING", "IN_PROGRESS"] }, actions: { type: "update_status", status: "OVERDUE" }, isActive: true },
    { name: "Tenant Housed → Close Tasks", triggerType: "tenant.status_changed", conditions: { status: "HOUSED" }, actions: { type: "close_tasks" }, isActive: true },
  ];

  await Promise.all(automationRules.map(rule =>
    prisma.automationRule.create({
      data: {
        name: rule.name,
        triggerType: rule.triggerType,
        conditionsJson: rule.conditions,
        actionsJson: rule.actions,
        isActive: rule.isActive,
      },
    })
  ));

  console.log("✓ Automation rules created");

  console.log("\n✅ KeevOS database seeded successfully!");
  console.log(`   Profiles: 3`);
  console.log(`   Caseworkers: ${caseworkers.length}`);
  console.log(`   Landlords: ${landlords.length}`);
  console.log(`   Brokers: ${brokers.length}`);
  console.log(`   Properties: ${properties.length}`);
  console.log(`   Tenants: ${tenants.length}`);
  console.log(`   Cases: ${cases.length}`);
  console.log(`   Tasks: 10`);
  console.log(`   Notes: 8`);
  console.log(`   Documents: 8`);
  console.log(`   Activity Logs: 20`);
  console.log(`   Automation Rules: ${automationRules.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
