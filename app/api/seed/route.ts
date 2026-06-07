import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const SEED_KEY = process.env.SEED_SECRET || "keevos-seed-2026";

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    // Clear existing data in order
    await prisma.activityLog.deleteMany();
    await prisma.document.deleteMany();
    await prisma.note.deleteMany();
    await prisma.task.deleteMany();
    await prisma.housingCase.deleteMany();
    await prisma.property.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.caseworker.deleteMany();
    await prisma.broker.deleteMany();
    await prisma.landlord.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.profile.deleteMany();

    // 1. Profiles (staff users)
    const admin = await prisma.profile.create({ data: { authUserId: "demo-owner-001", fullName: "Keev Owner", email: "owner@keevhousing.com", role: "OWNER", phone: "(212) 555-0001" } });
    const sarah = await prisma.profile.create({ data: { authUserId: "demo-manager-001", fullName: "Sarah Johnson", email: "manager@keevhousing.com", role: "MANAGER", phone: "(212) 555-0002" } });
    const mike = await prisma.profile.create({ data: { authUserId: "demo-staff-001", fullName: "Mike Torres", email: "staff@keevhousing.com", role: "STAFF", phone: "(212) 555-0003" } });

    // 2. Contacts — Landlords
    const cLandlord1 = await prisma.contact.create({ data: { fullName: "ABC Properties LLC", contactType: "LANDLORD", email: "leasing@abcproperties.com", phone: "(212) 555-0201", address: "350 Fifth Ave, New York, NY 10118", borough: "Manhattan", organization: "ABC Properties LLC", status: "ACTIVE" } });
    const cLandlord2 = await prisma.contact.create({ data: { fullName: "Bronx Realty Group", contactType: "LANDLORD", email: "info@bronxrealty.com", phone: "(718) 555-0202", address: "1180 Morris Ave, Bronx, NY 10456", borough: "Bronx", organization: "Bronx Realty Group", status: "ACTIVE" } });
    const cLandlord3 = await prisma.contact.create({ data: { fullName: "Brooklyn Heights Realty", contactType: "LANDLORD", email: "listings@bhrealty.com", phone: "(718) 555-0203", address: "100 Montague St, Brooklyn, NY 11201", borough: "Brooklyn", organization: "Brooklyn Heights Realty", status: "ACTIVE" } });
    const cLandlord4 = await prisma.contact.create({ data: { fullName: "Queens United Realty", contactType: "LANDLORD", email: "info@queensunited.com", phone: "(718) 555-0204", address: "89-10 Sutphin Blvd, Jamaica, NY 11435", borough: "Queens", organization: "Queens United Realty", status: "ACTIVE" } });
    const cLandlord5 = await prisma.contact.create({ data: { fullName: "Staten Island Properties", contactType: "LANDLORD", email: "office@siprop.com", phone: "(718) 555-0205", address: "1 Bay St, Staten Island, NY 10301", borough: "Staten Island", organization: "SI Properties Inc", status: "ACTIVE" } });

    // Contacts — Brokers
    const cBroker1 = await prisma.contact.create({ data: { fullName: "Metro NYC Brokers", contactType: "BROKER", email: "contact@metronyc.com", phone: "(212) 555-0301", address: "1440 Broadway, New York, NY 10018", borough: "Manhattan", organization: "Metro NYC Brokers", status: "ACTIVE" } });
    const cBroker2 = await prisma.contact.create({ data: { fullName: "Queens Housing Connect", contactType: "BROKER", email: "info@queenshousing.com", phone: "(718) 555-0302", address: "89-00 Sutphin Blvd, Jamaica, NY 11435", borough: "Queens", organization: "Queens Housing Connect", status: "ACTIVE" } });
    const cBroker3 = await prisma.contact.create({ data: { fullName: "BK Rental Solutions", contactType: "BROKER", email: "hello@bkrentals.com", phone: "(718) 555-0303", address: "365 Bridge St, Brooklyn, NY 11201", borough: "Brooklyn", organization: "BK Rental Solutions", status: "ACTIVE" } });

    // Contacts — Caseworkers
    const cCw1 = await prisma.contact.create({ data: { fullName: "Dr. Patricia Wells", contactType: "CASEWORKER", email: "p.wells@hra.nyc.gov", phone: "(212) 555-0401", address: "250 Church St, New York, NY 10013", borough: "Manhattan", organization: "NYC HRA", status: "ACTIVE" } });
    const cCw2 = await prisma.contact.create({ data: { fullName: "Marcus Thompson", contactType: "CASEWORKER", email: "m.thompson@hra.nyc.gov", phone: "(718) 555-0402", address: "1780 Grand Concourse, Bronx, NY 10457", borough: "Bronx", organization: "NYC HRA", status: "ACTIVE" } });
    const cCw3 = await prisma.contact.create({ data: { fullName: "Angela Rivera", contactType: "CASEWORKER", email: "a.rivera@dhs.nyc.gov", phone: "(718) 555-0403", address: "33 Beaver St, New York, NY 10004", borough: "Manhattan", organization: "NYC DHS", status: "ACTIVE" } });

    // Contacts — Tenants
    const cT1 = await prisma.contact.create({ data: { fullName: "Maria Rodriguez", contactType: "TENANT", email: "maria.rodriguez@gmail.com", phone: "(718) 555-0101", address: "234 Grand Concourse, Bronx, NY 10451", borough: "Bronx", status: "ACTIVE" } });
    const cT2 = await prisma.contact.create({ data: { fullName: "James Williams", contactType: "TENANT", email: "james.williams@gmail.com", phone: "(718) 555-0102", address: "891 Atlantic Ave, Brooklyn, NY 11238", borough: "Brooklyn", status: "ACTIVE" } });
    const cT3 = await prisma.contact.create({ data: { fullName: "Aisha Jackson", contactType: "TENANT", email: "aisha.jackson@gmail.com", phone: "(347) 555-0103", address: "DHS Shelter, Manhattan", borough: "Manhattan", status: "ACTIVE" } });
    const cT4 = await prisma.contact.create({ data: { fullName: "Carlos Mendez", contactType: "TENANT", email: "carlos.mendez@gmail.com", phone: "(718) 555-0104", address: "1245 Junction Blvd, Queens, NY 11368", borough: "Queens", status: "ACTIVE" } });
    const cT5 = await prisma.contact.create({ data: { fullName: "Tanya Brown", contactType: "TENANT", email: "tanya.brown@gmail.com", phone: "(718) 555-0105", address: "400 Forest Ave, Staten Island, NY 10301", borough: "Staten Island", status: "ACTIVE" } });
    const cT6 = await prisma.contact.create({ data: { fullName: "David Park", contactType: "TENANT", email: "david.park@gmail.com", phone: "(646) 555-0106", address: "567 Flatbush Ave, Brooklyn, NY 11225", borough: "Brooklyn", status: "ACTIVE" } });
    const cT7 = await prisma.contact.create({ data: { fullName: "Fatima Hassan", contactType: "TENANT", email: "fatima.hassan@gmail.com", phone: "(347) 555-0107", address: "BRC Shelter, Bronx, NY", borough: "Bronx", status: "ACTIVE" } });
    const cT8 = await prisma.contact.create({ data: { fullName: "Robert Chen", contactType: "TENANT", email: "robert.chen@gmail.com", phone: "(212) 555-0108", address: "245 W 108th St, New York, NY 10025", borough: "Manhattan", status: "ACTIVE" } });
    const cT9 = await prisma.contact.create({ data: { fullName: "Yolanda Davis", contactType: "TENANT", email: "y.davis@gmail.com", phone: "(718) 555-0109", address: "1020 E 180th St, Bronx, NY 10460", borough: "Bronx", status: "ACTIVE" } });
    const cT10 = await prisma.contact.create({ data: { fullName: "Kevin Okafor", contactType: "TENANT", email: "k.okafor@gmail.com", phone: "(718) 555-0110", address: "230 Lenox Ave, New York, NY 10027", borough: "Manhattan", status: "ACTIVE" } });
    const cT11 = await prisma.contact.create({ data: { fullName: "Linda Perez", contactType: "TENANT", email: "l.perez@gmail.com", phone: "(718) 555-0111", address: "4102 5th Ave, Brooklyn, NY 11232", borough: "Brooklyn", status: "ACTIVE" } });
    const cT12 = await prisma.contact.create({ data: { fullName: "Anthony Russo", contactType: "TENANT", email: "a.russo@gmail.com", phone: "(718) 555-0112", address: "142-20 Jamaica Ave, Queens, NY 11435", borough: "Queens", status: "ACTIVE" } });

    // 3. Landlords
    const ll1 = await prisma.landlord.create({ data: { contactId: cLandlord1.id, companyName: "ABC Properties LLC", portfolioSize: 45, section8Friendly: true, acceptsVouchers: true, notes: "Responsive, accepts most voucher types. Preferred partner." } });
    const ll2 = await prisma.landlord.create({ data: { contactId: cLandlord2.id, companyName: "Bronx Realty Group", portfolioSize: 30, section8Friendly: true, acceptsVouchers: true, notes: "Specializes in Bronx inventory. Quick turnaround." } });
    const ll3 = await prisma.landlord.create({ data: { contactId: cLandlord3.id, companyName: "Brooklyn Heights Realty", portfolioSize: 22, section8Friendly: false, acceptsVouchers: false, notes: "Does not accept vouchers. Market rate only." } });
    const ll4 = await prisma.landlord.create({ data: { contactId: cLandlord4.id, companyName: "Queens United Realty", portfolioSize: 38, section8Friendly: true, acceptsVouchers: true, notes: "Good inventory in Jamaica and Corona areas." } });
    const ll5 = await prisma.landlord.create({ data: { contactId: cLandlord5.id, companyName: "SI Properties Inc", portfolioSize: 15, section8Friendly: true, acceptsVouchers: true, notes: "Staten Island focused. Limited but reliable." } });

    // 4. Brokers
    const br1 = await prisma.broker.create({ data: { contactId: cBroker1.id, brokerageName: "Metro NYC Brokers", licenseNumber: "BR-10291", serviceAreas: ["Manhattan", "Bronx"], activeListingsCount: 8, commissionNotes: "1 month broker fee, waived for voucher holders" } });
    const br2 = await prisma.broker.create({ data: { contactId: cBroker2.id, brokerageName: "Queens Housing Connect", licenseNumber: "BR-20483", serviceAreas: ["Queens"], activeListingsCount: 5, commissionNotes: "15 days fee standard" } });
    const br3 = await prisma.broker.create({ data: { contactId: cBroker3.id, brokerageName: "BK Rental Solutions", licenseNumber: "BR-30912", serviceAreas: ["Brooklyn"], activeListingsCount: 6, commissionNotes: "No fee for Section 8" } });

    // 5. Caseworkers
    const cw1 = await prisma.caseworker.create({ data: { contactId: cCw1.id, agencyName: "NYC HRA", caseloadCount: 25, specialization: "Section 8, CityFHEPS" } });
    const cw2 = await prisma.caseworker.create({ data: { contactId: cCw2.id, agencyName: "NYC HRA", caseloadCount: 18, specialization: "HCV, HASA" } });
    const cw3 = await prisma.caseworker.create({ data: { contactId: cCw3.id, agencyName: "NYC DHS", caseloadCount: 30, specialization: "Shelter exit, CityFHEPS" } });

    // 6. Tenants
    const t1 = await prisma.tenant.create({ data: { contactId: cT1.id, voucherType: "Section 8", voucherSize: 2, householdSize: 3, maxRent: 2400, preferredBoroughs: ["Bronx", "Manhattan"], urgencyLevel: "HIGH", tenantStatus: "SEARCHING", assignedCaseworkerId: cw1.id, documentsComplete: true, notes: "Single mother, 2 kids. Prefers ground floor." } });
    const t2 = await prisma.tenant.create({ data: { contactId: cT2.id, voucherType: "CityFHEPS", voucherSize: 3, householdSize: 5, maxRent: 3200, preferredBoroughs: ["Brooklyn", "Queens"], urgencyLevel: "CRITICAL", tenantStatus: "SEARCHING", assignedCaseworkerId: cw2.id, documentsComplete: false, missingDocuments: ["Birth certificates", "Income verification"], notes: "Family of 5. Facing eviction notice." } });
    const t3 = await prisma.tenant.create({ data: { contactId: cT3.id, voucherType: "HASA", voucherSize: 1, householdSize: 1, maxRent: 1800, preferredBoroughs: ["Manhattan", "Bronx"], urgencyLevel: "CRITICAL", tenantStatus: "SEARCHING", assignedCaseworkerId: cw1.id, documentsComplete: false, missingDocuments: ["Medical verification"], notes: "Medical accommodations needed. Ground floor or elevator required." } });
    const t4 = await prisma.tenant.create({ data: { contactId: cT4.id, voucherType: "HCV", voucherSize: 2, householdSize: 2, maxRent: 2200, preferredBoroughs: ["Queens"], urgencyLevel: "MEDIUM", tenantStatus: "SEARCHING", assignedCaseworkerId: cw2.id, documentsComplete: true } });
    const t5 = await prisma.tenant.create({ data: { contactId: cT5.id, voucherType: "FHEPS", voucherSize: 2, householdSize: 3, maxRent: 2600, preferredBoroughs: ["Staten Island", "Brooklyn"], urgencyLevel: "LOW", tenantStatus: "HOUSED", documentsComplete: true, notes: "Successfully housed. Follow-up in 90 days." } });
    const t6 = await prisma.tenant.create({ data: { contactId: cT6.id, voucherType: "Section 8", voucherSize: 3, householdSize: 4, maxRent: 2900, preferredBoroughs: ["Brooklyn"], urgencyLevel: "HIGH", tenantStatus: "SEARCHING", assignedCaseworkerId: cw1.id, documentsComplete: true } });
    const t7 = await prisma.tenant.create({ data: { contactId: cT7.id, voucherType: "CityFHEPS", voucherSize: 1, householdSize: 1, maxRent: 1600, preferredBoroughs: ["Bronx", "Manhattan"], urgencyLevel: "CRITICAL", tenantStatus: "SEARCHING", assignedCaseworkerId: cw3.id, documentsComplete: false, missingDocuments: ["Photo ID", "CityFHEPS approval letter"] } });
    const t8 = await prisma.tenant.create({ data: { contactId: cT8.id, voucherType: "HCV", voucherSize: 2, householdSize: 2, maxRent: 2800, preferredBoroughs: ["Manhattan"], urgencyLevel: "LOW", tenantStatus: "APPROVED", assignedCaseworkerId: cw1.id, documentsComplete: true, notes: "Lease signing scheduled next week." } });
    const t9 = await prisma.tenant.create({ data: { contactId: cT9.id, voucherType: "LINC", voucherSize: 2, householdSize: 3, maxRent: 2300, preferredBoroughs: ["Bronx"], urgencyLevel: "HIGH", tenantStatus: "SEARCHING", assignedCaseworkerId: cw2.id, documentsComplete: true } });
    const t10 = await prisma.tenant.create({ data: { contactId: cT10.id, voucherType: "Section 8", voucherSize: 1, householdSize: 1, maxRent: 2100, preferredBoroughs: ["Manhattan", "Brooklyn"], urgencyLevel: "MEDIUM", tenantStatus: "SEARCHING", assignedCaseworkerId: cw3.id, documentsComplete: true } });
    const t11 = await prisma.tenant.create({ data: { contactId: cT11.id, voucherType: "FHEPS", voucherSize: 3, householdSize: 4, maxRent: 3000, preferredBoroughs: ["Brooklyn"], urgencyLevel: "HIGH", tenantStatus: "SEARCHING", assignedCaseworkerId: cw1.id, documentsComplete: false, missingDocuments: ["Lease history"] } });
    const t12 = await prisma.tenant.create({ data: { contactId: cT12.id, voucherType: "HCV", voucherSize: 2, householdSize: 2, maxRent: 2500, preferredBoroughs: ["Queens"], urgencyLevel: "MEDIUM", tenantStatus: "INSPECTION_PENDING", assignedCaseworkerId: cw2.id, documentsComplete: true } });

    // 7. Properties
    const p1 = await prisma.property.create({ data: { address: "1450 Grand Concourse, Bronx, NY 10451", borough: "Bronx", neighborhood: "Highbridge", propertyName: "Grand Concourse Apts", bedrooms: 2, bathrooms: 1, rent: 2200, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "CityFHEPS", "HCV"], status: "AVAILABLE", landlordId: ll2.id, utilitiesIncluded: ["Heat", "Hot Water"], laundry: true, internalNotes: "Recently renovated. Prefers long-term tenants." } });
    const p2 = await prisma.property.create({ data: { address: "789 Eastern Pkwy, Brooklyn, NY 11238", borough: "Brooklyn", neighborhood: "Crown Heights", bedrooms: 3, bathrooms: 2, rent: 2800, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "FHEPS"], status: "AVAILABLE", landlordId: ll3.id, brokerId: br3.id, elevator: true, internalNotes: "3BR unit, 2nd floor, elevator building." } });
    const p3 = await prisma.property.create({ data: { address: "245 W 108th St, Apt 4A, New York, NY 10025", borough: "Manhattan", neighborhood: "Manhattan Valley", bedrooms: 2, bathrooms: 1, rent: 2600, voucherAccepted: true, voucherTypesAccepted: ["HCV", "Section 8"], status: "OCCUPIED", landlordId: ll1.id, elevator: true, laundry: true } });
    const p4 = await prisma.property.create({ data: { address: "1245 Junction Blvd, Apt 2B, Queens, NY 11368", borough: "Queens", neighborhood: "Corona", propertyName: "Junction Heights", bedrooms: 2, bathrooms: 1, rent: 2100, voucherAccepted: true, voucherTypesAccepted: ["HCV", "Section 8", "CityFHEPS"], status: "AVAILABLE", landlordId: ll4.id, brokerId: br2.id, parking: true } });
    const p5 = await prisma.property.create({ data: { address: "400 Forest Ave, Apt 3C, Staten Island, NY 10301", borough: "Staten Island", neighborhood: "West Brighton", bedrooms: 2, bathrooms: 1, rent: 1900, voucherAccepted: true, voucherTypesAccepted: ["FHEPS", "Section 8"], status: "OCCUPIED", landlordId: ll5.id, laundry: true } });
    const p6 = await prisma.property.create({ data: { address: "567 Flatbush Ave, Apt 1F, Brooklyn, NY 11225", borough: "Brooklyn", neighborhood: "Flatbush", propertyName: "Flatbush Gardens", bedrooms: 3, bathrooms: 2, rent: 3100, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "CityFHEPS"], status: "AVAILABLE", landlordId: ll3.id, brokerId: br3.id, elevator: true } });
    const p7 = await prisma.property.create({ data: { address: "891 Atlantic Ave, Apt 5D, Brooklyn, NY 11238", borough: "Brooklyn", neighborhood: "Boerum Hill", bedrooms: 1, bathrooms: 1, rent: 2400, voucherAccepted: false, status: "PENDING", landlordId: ll1.id } });
    const p8 = await prisma.property.create({ data: { address: "234 Grand Concourse, Apt 7A, Bronx, NY 10451", borough: "Bronx", neighborhood: "Morrisania", propertyName: "Morrisania Plaza", bedrooms: 2, bathrooms: 1, rent: 2050, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "CityFHEPS", "LINC"], status: "AVAILABLE", landlordId: ll2.id, laundry: true } });
    const p9 = await prisma.property.create({ data: { address: "89-12 Sutphin Blvd, Apt 3A, Jamaica, NY 11435", borough: "Queens", neighborhood: "Jamaica", propertyName: "Jamaica Towers", bedrooms: 3, bathrooms: 2, rent: 2700, voucherAccepted: true, voucherTypesAccepted: ["HCV", "CityFHEPS", "Section 8"], status: "AVAILABLE", landlordId: ll4.id, brokerId: br2.id, parking: true, laundry: true } });
    const p10 = await prisma.property.create({ data: { address: "1780 Grand Concourse, Apt 2C, Bronx, NY 10457", borough: "Bronx", neighborhood: "Fordham", bedrooms: 1, bathrooms: 1, rent: 1800, voucherAccepted: true, voucherTypesAccepted: ["CityFHEPS", "HASA", "Section 8"], status: "AVAILABLE", landlordId: ll2.id, utilitiesIncluded: ["Heat"] } });
    const p11 = await prisma.property.create({ data: { address: "325 Wyckoff Ave, Apt 4E, Brooklyn, NY 11237", borough: "Brooklyn", neighborhood: "Bushwick", propertyName: "Bushwick Commons", bedrooms: 2, bathrooms: 1, rent: 2350, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "FHEPS"], status: "OCCUPIED", landlordId: ll3.id, laundry: true } });
    const p12 = await prisma.property.create({ data: { address: "142-30 Rockaway Blvd, Apt 6B, Queens, NY 11436", borough: "Queens", neighborhood: "South Ozone Park", bedrooms: 2, bathrooms: 1, rent: 2000, voucherAccepted: true, voucherTypesAccepted: ["Section 8", "HCV"], status: "AVAILABLE", landlordId: ll4.id } });

    // 8. Housing Cases
    const now = new Date();
    const future = (days: number) => new Date(now.getTime() + days * 86400000);
    const past = (days: number) => new Date(now.getTime() - days * 86400000);

    const case1 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-001", tenantId: t2.id, status: "SEARCHING", priority: "CRITICAL", caseSummary: "Family of 5 facing eviction, needs 3BR in Brooklyn or Queens. CityFHEPS voucher approved. Missing income docs.", nextFollowUpDate: future(1), assignedStaffId: sarah.id, caseworkerId: cw2.id } });
    const case2 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-002", tenantId: t3.id, status: "SEARCHING", priority: "CRITICAL", caseSummary: "Single adult exiting DHS shelter. HASA voucher. Requires ground floor or elevator unit due to mobility issues.", nextFollowUpDate: future(2), assignedStaffId: mike.id, caseworkerId: cw1.id } });
    const case3 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-003", tenantId: t1.id, propertyId: p1.id, status: "VIEWING_SCHEDULED", priority: "HIGH", caseSummary: "Maria viewing 2BR at Grand Concourse. Section 8 approved. Viewing Thursday 2pm.", nextFollowUpDate: future(3), assignedStaffId: sarah.id, caseworkerId: cw1.id } });
    const case4 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-004", tenantId: t7.id, status: "NEW", priority: "CRITICAL", caseSummary: "Fatima in emergency shelter. CityFHEPS voucher, needs 1BR urgently. Missing photo ID.", nextFollowUpDate: future(1), assignedStaffId: mike.id, caseworkerId: cw3.id } });
    const case5 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-005", tenantId: t6.id, propertyId: p6.id, status: "APPLICATION_STARTED", priority: "HIGH", caseSummary: "David applied for 3BR Flatbush Gardens. Section 8. Awaiting landlord approval. All docs submitted.", nextFollowUpDate: future(5), assignedStaffId: sarah.id, caseworkerId: cw1.id } });
    const case6 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-006", tenantId: t4.id, propertyId: p4.id, status: "VIEWING_SCHEDULED", priority: "MEDIUM", caseSummary: "Carlos viewing 2BR in Corona, Queens. HCV voucher. Walkthrough scheduled.", nextFollowUpDate: future(7), assignedStaffId: mike.id, caseworkerId: cw2.id } });
    const case7 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-007", tenantId: t8.id, propertyId: p3.id, status: "LEASE_SIGNING", priority: "LOW", caseSummary: "Robert signing lease at 245 W 108th St. HCV approved. Moving in next month.", nextFollowUpDate: future(4), assignedStaffId: sarah.id, caseworkerId: cw1.id } });
    await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-008", tenantId: t5.id, propertyId: p5.id, status: "HOUSED", priority: "LOW", caseSummary: "Tanya successfully housed at 400 Forest Ave, Staten Island. FHEPS. Closed.", assignedStaffId: sarah.id } });
    const case9 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-009", tenantId: t9.id, propertyId: p8.id, status: "VIEWING_SCHEDULED", priority: "HIGH", caseSummary: "Yolanda viewing 2BR Morrisania Plaza. LINC voucher. Landlord confirmed Thursday.", nextFollowUpDate: future(2), assignedStaffId: mike.id, caseworkerId: cw2.id } });
    const case10 = await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-010", tenantId: t12.id, propertyId: p12.id, status: "INSPECTION_PENDING", priority: "MEDIUM", caseSummary: "Anthony approved for South Ozone Park unit. HQS inspection scheduled.", nextFollowUpDate: future(6), assignedStaffId: sarah.id, caseworkerId: cw2.id } });
    await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-011", tenantId: t11.id, status: "SEARCHING", priority: "HIGH", caseSummary: "Linda needs 3BR in Brooklyn for family of 4. FHEPS voucher. Missing lease history doc.", nextFollowUpDate: future(3), assignedStaffId: mike.id, caseworkerId: cw1.id } });
    await prisma.housingCase.create({ data: { caseNumber: "CASE-2026-012", tenantId: t10.id, status: "SEARCHING", priority: "MEDIUM", caseSummary: "Kevin searching for 1BR in Manhattan or Brooklyn. Section 8 approved. All docs complete.", nextFollowUpDate: future(8), assignedStaffId: sarah.id, caseworkerId: cw3.id } });

    // 9. Tasks
    await prisma.task.create({ data: { title: "Schedule unit viewing — Grand Concourse", description: "Confirm viewing with landlord and Maria Rodriguez. Thursday 2pm.", relatedCaseId: case3.id, relatedContactId: cT1.id, assignedToId: sarah.id, dueDate: future(2), status: "PENDING", priority: "HIGH" } });
    await prisma.task.create({ data: { title: "Collect missing docs — James Williams", description: "Birth certificates and income verification still outstanding.", relatedCaseId: case1.id, relatedContactId: cT2.id, assignedToId: mike.id, dueDate: future(1), status: "PENDING", priority: "CRITICAL" } });
    await prisma.task.create({ data: { title: "Submit HQS inspection request — Junction Blvd", description: "File HQS inspection with HPD for Carlos Mendez unit.", relatedCaseId: case6.id, relatedPropertyId: p4.id, assignedToId: sarah.id, dueDate: future(3), status: "IN_PROGRESS", priority: "HIGH" } });
    await prisma.task.create({ data: { title: "Follow up with HRA — Fatima Hassan", description: "Confirm CityFHEPS voucher validity and check ID status.", relatedCaseId: case4.id, relatedContactId: cT7.id, assignedToId: mike.id, dueDate: future(1), status: "PENDING", priority: "CRITICAL" } });
    await prisma.task.create({ data: { title: "Prepare lease signing packet — Robert Chen", description: "Print and organize lease, HAP contract, and rider for signing.", relatedCaseId: case7.id, relatedContactId: cT8.id, relatedPropertyId: p3.id, assignedToId: sarah.id, dueDate: future(4), status: "IN_PROGRESS", priority: "MEDIUM" } });
    await prisma.task.create({ data: { title: "Outreach to 5 new landlords — Queens", description: "Expand voucher-friendly landlord network in Queens for 3BR units.", assignedToId: mike.id, dueDate: future(5), status: "PENDING", priority: "MEDIUM" } });
    await prisma.task.create({ data: { title: "Update case notes — Aisha Jackson", description: "Document DHS shelter caseworker meeting from yesterday.", relatedCaseId: case2.id, relatedContactId: cT3.id, assignedToId: mike.id, dueDate: past(1), status: "OVERDUE", priority: "HIGH" } });
    await prisma.task.create({ data: { title: "June 2026 housing outcomes report", description: "Compile placements, active cases, and voucher utilization for June.", assignedToId: admin.id, dueDate: future(25), status: "PENDING", priority: "LOW" } });
    await prisma.task.create({ data: { title: "HQS inspection follow-up — South Ozone Park", description: "Check HPD inspection status for Anthony Russo unit.", relatedCaseId: case10.id, assignedToId: sarah.id, dueDate: future(6), status: "PENDING", priority: "MEDIUM" } });
    await prisma.task.create({ data: { title: "Confirm Yolanda Davis viewing — Morrisania", description: "Call landlord to reconfirm Thursday viewing time.", relatedCaseId: case9.id, relatedContactId: cT9.id, assignedToId: mike.id, dueDate: future(1), status: "PENDING", priority: "HIGH" } });

    // 10. Notes
    await prisma.note.create({ data: { note: "Maria confirmed she can do Thursday 2pm. Landlord also confirmed. Will meet at unit.", noteType: "CALL", relatedCaseId: case3.id, relatedContactId: cT1.id, createdById: sarah.id } });
    await prisma.note.create({ data: { note: "James is aware of missing documents. His caseworker Marcus is helping gather birth certificates.", noteType: "MEETING", relatedCaseId: case1.id, relatedContactId: cT2.id, createdById: mike.id } });
    await prisma.note.create({ data: { note: "Spoke with DHS caseworker Angela Rivera. Aisha's shelter placement extended 30 days while we search.", noteType: "CALL", relatedCaseId: case2.id, relatedContactId: cT3.id, createdById: mike.id } });
    await prisma.note.create({ data: { note: "Flatbush Gardens landlord (Brooklyn Heights Realty) requested 3 months bank statements. David is gathering.", noteType: "EMAIL", relatedCaseId: case5.id, createdById: sarah.id } });
    await prisma.note.create({ data: { note: "Robert Chen lease signing confirmed for June 15. All HAP contract paperwork in order.", noteType: "STATUS_UPDATE", relatedCaseId: case7.id, relatedContactId: cT8.id, createdById: sarah.id } });

    // 11. Activity Logs
    await prisma.activityLog.create({ data: { action: "CASE_UPDATED", entityType: "HousingCase", entityId: case3.id, actorId: sarah.id, newValues: { status: "VIEWING_SCHEDULED" } } });
    await prisma.activityLog.create({ data: { action: "CASE_CREATED", entityType: "HousingCase", entityId: case4.id, actorId: mike.id } });
    await prisma.activityLog.create({ data: { action: "CONTACT_CREATED", entityType: "Contact", entityId: cT7.id, actorId: mike.id } });
    await prisma.activityLog.create({ data: { action: "CASE_UPDATED", entityType: "HousingCase", entityId: case5.id, actorId: sarah.id, newValues: { status: "APPLICATION_STARTED" } } });
    await prisma.activityLog.create({ data: { action: "CASE_UPDATED", entityType: "HousingCase", entityId: case7.id, actorId: sarah.id, newValues: { status: "LEASE_SIGNING" } } });
    await prisma.activityLog.create({ data: { action: "TENANT_UPDATED", entityType: "Tenant", entityId: t5.id, actorId: sarah.id, newValues: { tenantStatus: "HOUSED" } } });
    await prisma.activityLog.create({ data: { action: "PROPERTY_CREATED", entityType: "Property", entityId: p10.id, actorId: admin.id } });
    await prisma.activityLog.create({ data: { action: "CONTACT_CREATED", entityType: "Contact", entityId: cT9.id, actorId: mike.id } });
    await prisma.activityLog.create({ data: { action: "CASE_CREATED", entityType: "HousingCase", entityId: case9.id, actorId: mike.id } });
    await prisma.activityLog.create({ data: { action: "TASK_CREATED", entityType: "Task", entityId: "task-review", actorId: sarah.id, newValues: { title: "Prepare lease signing packet" } } });

    const counts = {
      profiles: await prisma.profile.count(),
      contacts: await prisma.contact.count(),
      landlords: await prisma.landlord.count(),
      brokers: await prisma.broker.count(),
      caseworkers: await prisma.caseworker.count(),
      tenants: await prisma.tenant.count(),
      properties: await prisma.property.count(),
      housingCases: await prisma.housingCase.count(),
      tasks: await prisma.task.count(),
      notes: await prisma.note.count(),
      activityLogs: await prisma.activityLog.count(),
    };

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with NYC housing data",
      counts,
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const counts = {
      contacts: await prisma.contact.count(),
      tenants: await prisma.tenant.count(),
      properties: await prisma.property.count(),
      housingCases: await prisma.housingCase.count(),
    };
    await prisma.$disconnect();
    const seeded = counts.contacts > 0;
    return NextResponse.json({ seeded, counts });
  } catch {
    await prisma.$disconnect();
    return NextResponse.json({ seeded: false, error: "Could not connect to database" });
  }
}
