import { randomUUID } from "node:crypto";

export const JOB_CARD_STATUSES = [
  "CREATED",
  "INSPECTION",
  "ESTIMATE_SENT",
  "APPROVED",
  "PARTS_ORDERED",
  "WORK_IN_PROGRESS",
  "READY",
  "DELIVERED",
];

const parts = [
  {
    id: "part-101",
    partNumber: "ENG-001",
    description: "Main drive motor",
    quantity: 1,
    availability: true,
    turnaroundDays: 1,
    unitPrice: 14500,
    supersededBy: null,
    alternativePartIds: ["part-201"],
  },
  {
    id: "part-102",
    partNumber: "FLT-114",
    description: "Primary inline filter",
    quantity: 2,
    availability: true,
    turnaroundDays: 1,
    unitPrice: 1450,
    supersededBy: null,
    alternativePartIds: ["part-202"],
  },
  {
    id: "part-103",
    partNumber: "HSE-320",
    description: "Pressure hose assembly",
    quantity: 4,
    availability: false,
    turnaroundDays: 2,
    unitPrice: 2850,
    supersededBy: "HSE-321",
    alternativePartIds: ["part-203"],
  },
  {
    id: "part-104",
    partNumber: "VLV-078",
    description: "Flow control valve",
    quantity: 1,
    availability: true,
    turnaroundDays: 1,
    unitPrice: 3620,
    supersededBy: null,
    alternativePartIds: [],
  },
  {
    id: "part-105",
    partNumber: "SNS-550",
    description: "Temperature sensor module",
    quantity: 3,
    availability: false,
    turnaroundDays: 3,
    unitPrice: 1970,
    supersededBy: null,
    alternativePartIds: [],
  },
  {
    id: "part-201",
    partNumber: "ENG-001A",
    description: "Main drive motor (aftermarket alternative)",
    quantity: 1,
    availability: true,
    turnaroundDays: 2,
    unitPrice: 12200,
    supersededBy: null,
    alternativePartIds: [],
  },
  {
    id: "part-202",
    partNumber: "FLT-114B",
    description: "Primary inline filter (economy)",
    quantity: 2,
    availability: true,
    turnaroundDays: 1,
    unitPrice: 990,
    supersededBy: null,
    alternativePartIds: [],
  },
  {
    id: "part-203",
    partNumber: "HSE-320X",
    description: "Pressure hose assembly reinforced",
    quantity: 4,
    availability: true,
    turnaroundDays: 2,
    unitPrice: 3110,
    supersededBy: null,
    alternativePartIds: [],
  },
];

const serviceCatalog = [
  { id: "svc-101", name: "Engine Oil Change", defaultCost: 1850 },
  { id: "svc-102", name: "Filter Replacement Labor", defaultCost: 900 },
  { id: "svc-103", name: "General Inspection", defaultCost: 650 },
  { id: "svc-104", name: "Brake Cleaning", defaultCost: 1200 },
  { id: "svc-105", name: "Coolant Top-up", defaultCost: 480 },
];

let hotspots = [
  {
    id: "hotspot-1",
    label: "1",
    x: 0.12,
    y: 0.2,
    width: 0.11,
    height: 0.15,
    partId: "part-101",
  },
  {
    id: "hotspot-2",
    label: "2",
    x: 0.3,
    y: 0.58,
    width: 0.1,
    height: 0.14,
    partId: "part-102",
  },
  {
    id: "hotspot-3",
    label: "3",
    x: 0.5,
    y: 0.32,
    width: 0.1,
    height: 0.14,
    partId: "part-103",
  },
  {
    id: "hotspot-4",
    label: "4",
    x: 0.68,
    y: 0.6,
    width: 0.12,
    height: 0.16,
    partId: "part-104",
  },
  {
    id: "hotspot-5",
    label: "5",
    x: 0.82,
    y: 0.18,
    width: 0.1,
    height: 0.14,
    partId: "part-105",
  },
];

let diagramImagePath = null;
let jobCardCounter = 1000;

const jobCards = [
  {
    id: "JC-001000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "CREATED",
    customer: {
      name: "Rohit Sharma",
      phone: "9876543210",
      email: "rohit@example.com",
    },
    vehicle: {
      registrationNumber: "MH12AB4312",
      chassisNumber: "MALNAA1234RT99881",
      make: "Nissan",
      model: "Terrano",
      variant: "XV D THP 110ps",
      fuelType: "Diesel",
      year: 2018,
    },
    technician: "Ravi Kumar",
    bayNumber: "Bay-3",
    warrantyApplicable: false,
    customerApproval: {
      approved: false,
      approvedAt: null,
      channel: null,
    },
    serviceItems: [
      { name: "Engine Oil Change", cost: 1850 },
      { name: "General Inspection", cost: 650 },
    ],
    partItems: [
      {
        partId: "part-102",
        partNumber: "FLT-114",
        description: "Primary inline filter",
        quantity: 2,
        unitPrice: 1450,
        lineTotal: 2900,
        availability: true,
        turnaroundDays: 1,
      },
    ],
    discountPercent: 0,
    taxPercent: 18,
    serviceSubtotal: 2500,
    partsSubtotal: 2900,
    grossTotal: 5400,
    discountAmount: 0,
    taxAmount: 972,
    totalAmount: 6372,
    notes: "Customer requests delivery by evening.",
  },
];

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getParts(query) {
  if (!query) {
    return parts;
  }

  const needle = query.toLowerCase();
  return parts.filter(
    (part) =>
      part.partNumber.toLowerCase().includes(needle) ||
      part.description.toLowerCase().includes(needle),
  );
}

export function getPartById(partId) {
  return parts.find((item) => item.id === partId);
}

export function getPartAlternatives(partId) {
  const part = getPartById(partId);
  if (!part) {
    return [];
  }

  return part.alternativePartIds
    .map((altId) => getPartById(altId))
    .filter((item) => Boolean(item));
}

export function getServiceCatalog() {
  return serviceCatalog;
}

export function getHotspots() {
  return hotspots;
}

export function addHotspot(input) {
  const hotspot = {
    id: `hotspot-${randomUUID()}`,
    label: input.label,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    partId: input.partId,
  };

  hotspots = [...hotspots, hotspot];
  return hotspot;
}

export function setDiagramImagePath(imagePath) {
  diagramImagePath = imagePath;
}

export function getDiagramImagePath() {
  return diagramImagePath;
}

function normalizeServiceItems(serviceItems = []) {
  return serviceItems
    .filter((item) => item && typeof item.name === "string" && item.name.trim().length > 0)
    .map((item) => ({
      name: item.name.trim(),
      cost: Number(item.cost) > 0 ? Number(item.cost) : 0,
    }));
}

function normalizePartItems(partItems = []) {
  return partItems
    .map((item) => {
      const part = getPartById(item.partId);
      if (!part) {
        return null;
      }

      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      const unitPrice = Number(item.unitPrice) > 0 ? Number(item.unitPrice) : part.unitPrice;

      return {
        partId: part.id,
        partNumber: part.partNumber,
        description: part.description,
        quantity,
        unitPrice,
        lineTotal: roundCurrency(quantity * unitPrice),
        availability: part.availability,
        turnaroundDays: part.turnaroundDays,
      };
    })
    .filter((item) => Boolean(item));
}

function computeTotals({ serviceItems, partItems, discountPercent = 0, taxPercent = 18 }) {
  const serviceSubtotal = roundCurrency(
    serviceItems.reduce((sum, item) => sum + Number(item.cost || 0), 0),
  );
  const partsSubtotal = roundCurrency(
    partItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
  );
  const grossTotal = roundCurrency(serviceSubtotal + partsSubtotal);

  const safeDiscountPercent = Number(discountPercent) > 0 ? Number(discountPercent) : 0;
  const safeTaxPercent = Number(taxPercent) >= 0 ? Number(taxPercent) : 0;

  const discountAmount = roundCurrency((grossTotal * safeDiscountPercent) / 100);
  const taxableBase = roundCurrency(grossTotal - discountAmount);
  const taxAmount = roundCurrency((taxableBase * safeTaxPercent) / 100);
  const totalAmount = roundCurrency(taxableBase + taxAmount);

  return {
    serviceSubtotal,
    partsSubtotal,
    grossTotal,
    discountAmount,
    taxAmount,
    totalAmount,
    discountPercent: safeDiscountPercent,
    taxPercent: safeTaxPercent,
  };
}

export function createJobCard(input) {
  jobCardCounter += 1;
  const now = new Date().toISOString();

  const serviceItems = normalizeServiceItems(input.serviceItems);
  const partItems = normalizePartItems(input.partItems);

  const totals = computeTotals({
    serviceItems,
    partItems,
    discountPercent: input.discountPercent,
    taxPercent: input.taxPercent,
  });

  const status = JOB_CARD_STATUSES.includes(input.status) ? input.status : "CREATED";
  const approved = Boolean(input.customerApproval?.approved);

  const jobCard = {
    id: `JC-${String(jobCardCounter).padStart(6, "0")}`,
    createdAt: now,
    updatedAt: now,
    status,
    customer: {
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email || "",
    },
    vehicle: {
      registrationNumber: input.vehicle.registrationNumber || "",
      chassisNumber: input.vehicle.chassisNumber,
      make: input.vehicle.make || "",
      model: input.vehicle.model || "",
      variant: input.vehicle.variant || "",
      fuelType: input.vehicle.fuelType || "",
      year: Number(input.vehicle.year) || null,
    },
    technician: input.technician || "",
    bayNumber: input.bayNumber || "",
    warrantyApplicable: Boolean(input.warrantyApplicable),
    customerApproval: {
      approved,
      approvedAt: approved
        ? input.customerApproval?.approvedAt || new Date().toISOString()
        : null,
      channel: approved ? input.customerApproval?.channel || "WHATSAPP" : null,
    },
    serviceItems,
    partItems,
    notes: input.notes || "",
    ...totals,
  };

  jobCards.unshift(jobCard);
  return jobCard;
}

export function getJobCards(filters = {}) {
  if (!filters.customerPhone) {
    return jobCards;
  }

  return jobCards.filter((card) =>
    card.customer.phone.toLowerCase().includes(String(filters.customerPhone).toLowerCase()),
  );
}

export function getJobCardById(jobCardId) {
  return jobCards.find((card) => card.id === jobCardId);
}

export function updateJobCardStatus(jobCardId, status) {
  const card = getJobCardById(jobCardId);
  if (!card) {
    return null;
  }

  card.status = status;
  card.updatedAt = new Date().toISOString();
  return card;
}

export function getJobCardMetrics() {
  const byStatus = JOB_CARD_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  let totalRevenue = 0;
  for (const card of jobCards) {
    byStatus[card.status] += 1;
    totalRevenue += Number(card.totalAmount || 0);
  }

  return {
    totalJobCards: jobCards.length,
    totalRevenue: roundCurrency(totalRevenue),
    byStatus,
  };
}
