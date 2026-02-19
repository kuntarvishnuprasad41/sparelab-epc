"use client";

import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  partId: string;
};

type Part = {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
};

type DiagramResponse = {
  imagePath: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://backend-sl.vishnuprasadkuntar.me";

function resolveImageSrc(imagePath: string | null): string {
  if (!imagePath) {
    return "/diagram.svg";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${API_BASE_URL}${imagePath}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export default function AdminPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [diagramSrc, setDiagramSrc] = useState("/diagram.svg");
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [label, setLabel] = useState("6");
  const [partId, setPartId] = useState("");
  const [width, setWidth] = useState(0.1);
  const [height, setHeight] = useState(0.14);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [hotspotData, partData, diagramData] = await Promise.all([
          fetchJson<Hotspot[]>(`${API_BASE_URL}/api/hotspots`),
          fetchJson<Part[]>(`${API_BASE_URL}/api/parts`),
          fetchJson<DiagramResponse>(`${API_BASE_URL}/api/diagram`),
        ]);

        setHotspots(hotspotData);
        setParts(partData);
        setPartId(partData[0]?.id ?? "");
        setLabel(String(hotspotData.length + 1));
        setDiagramSrc(resolveImageSrc(diagramData.imagePath));
      } catch {
        setError("Failed to load admin data. Confirm backend is running on port 4000.");
      }
    };

    load();
  }, []);

  const handleImageClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width);
    const y = clamp((event.clientY - rect.top) / rect.height);
    setSelectedPoint({ x, y });
    setMessage(`Placement set to (${x.toFixed(3)}, ${y.toFixed(3)}).`);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!uploadFile) {
      setError("Select an image first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", uploadFile);

      const response = await fetch(`${API_BASE_URL}/api/admin/diagram-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const payload = (await response.json()) as DiagramResponse;
      setDiagramSrc(resolveImageSrc(payload.imagePath));
      setUploadFile(null);
      setMessage("Diagram image uploaded successfully.");
    } catch {
      setError("Unable to upload image.");
    }
  };

  const handleCreateHotspot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedPoint) {
      setError("Click on the diagram first to set hotspot position.");
      return;
    }

    if (!partId) {
      setError("Choose a part.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hotspots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          x: selectedPoint.x,
          y: selectedPoint.y,
          width,
          height,
          partId,
        }),
      });

      if (!response.ok) {
        throw new Error("Create hotspot failed");
      }

      const hotspot = (await response.json()) as Hotspot;
      setHotspots((previous) => [...previous, hotspot]);
      const parsedLabel = Number.parseInt(label, 10);
      if (Number.isFinite(parsedLabel)) {
        setLabel(String(parsedLabel + 1));
      }
      setSelectedPoint(null);
      setMessage(`Hotspot ${hotspot.label} created.`);
    } catch {
      setError("Unable to create hotspot.");
    }
  };

  const partLookup = useMemo(
    () => Object.fromEntries(parts.map((part) => [part.id, part.partNumber])),
    [parts],
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Upload a diagram image and create hotspots with click-to-place coordinates.</p>
        <Link href="/" className={styles.backLink}>
          Back to Viewer
        </Link>
      </header>

      <section className={styles.card}>
        <h2>1. Upload Diagram Image</h2>
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
          />
          <button type="submit">Upload</button>
        </form>
      </section>

      <section className={styles.card}>
        <h2>2. Add Hotspot</h2>
        <div className={styles.editorGrid}>
          <div className={styles.diagramPanel}>
            <div className={styles.diagramContainer} onClick={handleImageClick}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={diagramSrc} alt="Diagram for hotspot editing" className={styles.diagramImage} />

              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className={styles.hotspotPreview}
                  style={{
                    left: `${hotspot.x * 100}%`,
                    top: `${hotspot.y * 100}%`,
                    width: `${hotspot.width * 100}%`,
                    height: `${hotspot.height * 100}%`,
                  }}
                >
                  {hotspot.label}
                </div>
              ))}

              {selectedPoint && (
                <div
                  className={styles.hotspotDraft}
                  style={{
                    left: `${selectedPoint.x * 100}%`,
                    top: `${selectedPoint.y * 100}%`,
                    width: `${width * 100}%`,
                    height: `${height * 100}%`,
                  }}
                >
                  {label}
                </div>
              )}
            </div>
            <p className={styles.helperText}>Click on image to choose X/Y placement.</p>
          </div>

          <form onSubmit={handleCreateHotspot} className={styles.formFields}>
            <label>
              Label
              <input value={label} onChange={(event) => setLabel(event.target.value)} required />
            </label>

            <label>
              Part
              <select value={partId} onChange={(event) => setPartId(event.target.value)} required>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partNumber} - {part.description}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Width (0 to 1)
              <input
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={width}
                onChange={(event) => setWidth(clamp(Number(event.target.value)))}
                required
              />
            </label>

            <label>
              Height (0 to 1)
              <input
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={height}
                onChange={(event) => setHeight(clamp(Number(event.target.value)))}
                required
              />
            </label>

            <label>
              X
              <input value={selectedPoint?.x.toFixed(3) ?? "Click image"} readOnly />
            </label>

            <label>
              Y
              <input value={selectedPoint?.y.toFixed(3) ?? "Click image"} readOnly />
            </label>

            <button type="submit">Create Hotspot</button>
          </form>
        </div>
      </section>

      {(message || error) && (
        <section className={styles.card}>
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>
      )}

      <section className={styles.card}>
        <h2>3. Existing Hotspots</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Part Number</th>
              <th>X</th>
              <th>Y</th>
              <th>Width</th>
              <th>Height</th>
            </tr>
          </thead>
          <tbody>
            {hotspots.map((hotspot) => (
              <tr key={hotspot.id}>
                <td>{hotspot.label}</td>
                <td>{partLookup[hotspot.partId] ?? hotspot.partId}</td>
                <td>{hotspot.x.toFixed(3)}</td>
                <td>{hotspot.y.toFixed(3)}</td>
                <td>{hotspot.width.toFixed(3)}</td>
                <td>{hotspot.height.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
