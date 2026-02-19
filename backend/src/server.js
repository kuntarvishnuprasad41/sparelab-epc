import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import multer from "multer";
import {
  JOB_CARD_STATUSES,
  addHotspot,
  createJobCard,
  getDiagramImagePath,
  getHotspots,
  getJobCardById,
  getJobCardMetrics,
  getJobCards,
  getPartAlternatives,
  getPartById,
  getParts,
  getServiceCatalog,
  setDiagramImagePath,
  updateJobCardStatus,
} from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

function validateHotspotPayload(payload) {
  const { label, x, y, width, height, partId } = payload;

  const boundedFields = { x, y, width, height };
  for (const [key, value] of Object.entries(boundedFields)) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      return `${key} must be a number between 0 and 1`;
    }
  }

  if (width === 0 || height === 0) {
    return "width and height must be greater than 0";
  }

  if (typeof label !== "string" || label.trim().length === 0) {
    return "label is required";
  }

  if (typeof partId !== "string" || !getPartById(partId)) {
    return "partId must reference an existing part";
  }

  return null;
}

function validateCreateJobCardPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Request body is required";
  }

  const customer = payload.customer;
  if (!customer || typeof customer.name !== "string" || customer.name.trim().length === 0) {
    return "customer.name is required";
  }

  if (!customer.phone || typeof customer.phone !== "string") {
    return "customer.phone is required";
  }

  const vehicle = payload.vehicle;
  if (!vehicle || typeof vehicle.chassisNumber !== "string" || vehicle.chassisNumber.trim().length === 0) {
    return "vehicle.chassisNumber is required";
  }

  return null;
}

function mockExtractRcDetails(filename) {
  const lowered = filename.toLowerCase();
  const suffix = String(Date.now()).slice(-6);

  if (lowered.includes("terrano") || lowered.includes("nissan")) {
    return {
      registrationNumber: `MH12TR${suffix.slice(-4)}`,
      chassisNumber: `MALNISSANTERR${suffix}`,
      make: "Nissan",
      model: "Terrano",
      variant: "XV D THP 110ps",
      fuelType: "Diesel",
      year: 2018,
    };
  }

  return {
    registrationNumber: `MH14RC${suffix.slice(-4)}`,
    chassisNumber: `MA1CHASSIS${suffix}`,
    make: "Unknown",
    model: "Unknown",
    variant: "Unknown",
    fuelType: "Unknown",
    year: 2019,
  };
}

app.get("/api/diagram", (_req, res) => {
  res.json({ imagePath: getDiagramImagePath() });
});

app.get("/api/hotspots", (_req, res) => {
  res.json(getHotspots());
});

app.post("/api/admin/hotspots", (req, res) => {
  const error = validateHotspotPayload(req.body);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const hotspot = addHotspot({
    label: req.body.label.trim(),
    x: req.body.x,
    y: req.body.y,
    width: req.body.width,
    height: req.body.height,
    partId: req.body.partId,
  });

  res.status(201).json(hotspot);
});

app.post("/api/admin/diagram-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Image file is required" });
    return;
  }

  const imagePath = `/uploads/${req.file.filename}`;
  setDiagramImagePath(imagePath);

  res.status(201).json({ imagePath });
});

app.post("/api/ocr/rc", upload.single("rcImage"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "rcImage file is required" });
    return;
  }

  const extracted = mockExtractRcDetails(req.file.originalname);
  res.json({
    confidence: 0.89,
    extracted,
    filePath: `/uploads/${req.file.filename}`,
  });
});

app.get("/api/parts", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : "";
  res.json(getParts(query));
});

app.get("/api/parts/:partId", (req, res) => {
  const part = getPartById(req.params.partId);

  if (!part) {
    res.status(404).json({ message: "Part not found" });
    return;
  }

  res.json(part);
});

app.get("/api/parts/:partId/alternatives", (req, res) => {
  const part = getPartById(req.params.partId);
  if (!part) {
    res.status(404).json({ message: "Part not found" });
    return;
  }

  res.json({
    partId: part.id,
    supersededBy: part.supersededBy,
    alternatives: getPartAlternatives(part.id),
  });
});

app.get("/api/services", (_req, res) => {
  res.json(getServiceCatalog());
});

app.get("/api/job-cards/statuses", (_req, res) => {
  res.json(JOB_CARD_STATUSES);
});

app.get("/api/job-cards/metrics", (_req, res) => {
  res.json(getJobCardMetrics());
});

app.get("/api/job-cards", (req, res) => {
  const customerPhone = typeof req.query.customerPhone === "string" ? req.query.customerPhone : "";
  res.json(getJobCards({ customerPhone }));
});

app.get("/api/job-cards/:jobCardId", (req, res) => {
  const card = getJobCardById(req.params.jobCardId);
  if (!card) {
    res.status(404).json({ message: "Job card not found" });
    return;
  }

  res.json(card);
});

app.post("/api/job-cards", (req, res) => {
  const error = validateCreateJobCardPayload(req.body);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const jobCard = createJobCard(req.body);
  res.status(201).json(jobCard);
});

app.patch("/api/job-cards/:jobCardId/status", (req, res) => {
  const { status } = req.body;
  if (!JOB_CARD_STATUSES.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const updated = updateJobCardStatus(req.params.jobCardId, status);
  if (!updated) {
    res.status(404).json({ message: "Job card not found" });
    return;
  }

  res.json(updated);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
