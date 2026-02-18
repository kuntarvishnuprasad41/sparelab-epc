import { randomUUID } from "node:crypto";

const parts = [
  {
    id: "part-101",
    partNumber: "ENG-001",
    description: "Main drive motor",
    quantity: 1,
  },
  {
    id: "part-102",
    partNumber: "FLT-114",
    description: "Primary inline filter",
    quantity: 2,
  },
  {
    id: "part-103",
    partNumber: "HSE-320",
    description: "Pressure hose assembly",
    quantity: 4,
  },
  {
    id: "part-104",
    partNumber: "VLV-078",
    description: "Flow control valve",
    quantity: 1,
  },
  {
    id: "part-105",
    partNumber: "SNS-550",
    description: "Temperature sensor module",
    quantity: 3,
  },
];

let hotspots = [

];

let diagramImagePath = null;

export function getParts() {
  return parts;
}

export function getPartById(partId) {
  return parts.find((item) => item.id === partId);
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
