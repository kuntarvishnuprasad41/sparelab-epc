import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import multer from "multer";
import {
  addHotspot,
  getDiagramImagePath,
  getHotspots,
  getPartById,
  getParts,
  setDiagramImagePath,
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

app.get("/api/diagram", (_req, res) => {
  res.json({ imagePath: getDiagramImagePath() });
});

app.get("/api/hotspots", (_req, res) => {
  res.json(getHotspots());
});

app.post("/api/admin/hotspots", (req, res) => {
  const { label, x, y, width, height, partId } = req.body;

  const boundedFields = { x, y, width, height };
  for (const [key, value] of Object.entries(boundedFields)) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      res.status(400).json({ message: `${key} must be a number between 0 and 1` });
      return;
    }
  }

  if (width === 0 || height === 0) {
    res.status(400).json({ message: "width and height must be greater than 0" });
    return;
  }

  if (typeof label !== "string" || label.trim().length === 0) {
    res.status(400).json({ message: "label is required" });
    return;
  }

  if (typeof partId !== "string" || !getPartById(partId)) {
    res.status(400).json({ message: "partId must reference an existing part" });
    return;
  }

  const hotspot = addHotspot({
    label: label.trim(),
    x,
    y,
    width,
    height,
    partId,
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

app.get("/api/parts", (_req, res) => {
  res.json(getParts());
});

app.get("/api/parts/:partId", (req, res) => {
  const part = getPartById(req.params.partId);

  if (!part) {
    res.status(404).json({ message: "Part not found" });
    return;
  }

  res.json(part);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
