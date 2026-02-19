"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

export default function Home() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspotIds, setSelectedHotspotIds] = useState<string[]>([]);
  const [partCache, setPartCache] = useState<Record<string, Part>>({});
  const [diagramSrc, setDiagramSrc] = useState("/diagram.svg");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hotspotData, diagramData] = await Promise.all([
          fetchJson<Hotspot[]>(`${API_BASE_URL}/api/hotspots`),
          fetchJson<DiagramResponse>(`${API_BASE_URL}/api/diagram`),
        ]);

        setHotspots(hotspotData);
        setDiagramSrc(resolveImageSrc(diagramData.imagePath));
      } catch {
        setError("Unable to load viewer data. Confirm backend is running on port 4000.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleHotspotClick = async (hotspot: Hotspot) => {
    const isSelected = selectedHotspotIds.includes(hotspot.id);

    setSelectedHotspotIds((previous) =>
      isSelected
        ? previous.filter((itemId) => itemId !== hotspot.id)
        : [...previous, hotspot.id],
    );

    if (isSelected) {
      return;
    }

    if (!partCache[hotspot.partId]) {
      try {
        const part = await fetchJson<Part>(`${API_BASE_URL}/api/parts/${hotspot.partId}`);
        setPartCache((previous) => ({ ...previous, [part.id]: part }));
      } catch {
        setError(`Unable to load details for part ${hotspot.partId}.`);
      }
    }

    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedRows = useMemo(
    () =>
      selectedHotspotIds
        .map((hotspotId) => hotspots.find((hotspot) => hotspot.id === hotspotId))
        .filter((hotspot): hotspot is Hotspot => Boolean(hotspot))
        .map((hotspot) => ({
          hotspot,
          part: partCache[hotspot.partId],
        })),
    [hotspots, partCache, selectedHotspotIds],
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <h1>Parts Diagram</h1>
          <Link href="/admin" className={styles.adminLink}>
            Open Admin Dashboard
          </Link>
        </div>
        <p>Click one or more hotspots to load part details.</p>
      </header>

      <section className={styles.diagramCard}>
        <div className={styles.diagramContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={diagramSrc} alt="Parts diagram" className={styles.diagramImage} />

          {!isLoading &&
            hotspots.map((hotspot) => {
              const isSelected = selectedHotspotIds.includes(hotspot.id);

              return (
                <button
                  type="button"
                  key={hotspot.id}
                  aria-label={`Select part ${hotspot.label}`}
                  onClick={() => handleHotspotClick(hotspot)}
                  className={`${styles.hotspot} ${
                    isSelected ? styles.hotspotSelected : ""
                  }`}
                  style={{
                    left: `${hotspot.x * 100}%`,
                    top: `${hotspot.y * 100}%`,
                    width: `${hotspot.width * 100}%`,
                    height: `${hotspot.height * 100}%`,
                  }}
                >
                  <span>{hotspot.label}</span>
                </button>
              );
            })}
        </div>
      </section>

      <section className={styles.tableSection} ref={tableRef}>
        <h2>Selected Parts</h2>

        {error && <p className={styles.error}>{error}</p>}

        <table className={styles.partsTable}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Part Number</th>
              <th>Description</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {selectedRows.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  No parts selected yet.
                </td>
              </tr>
            ) : (
              selectedRows.map(({ hotspot, part }) => (
                <tr key={hotspot.id}>
                  <td>{hotspot.label}</td>
                  <td>{part?.partNumber ?? "Loading..."}</td>
                  <td>{part?.description ?? "Loading part details"}</td>
                  <td>{part?.quantity ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
