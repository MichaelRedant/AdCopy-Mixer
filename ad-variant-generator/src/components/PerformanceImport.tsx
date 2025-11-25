import React, { useRef, useState } from 'react';
import { PerformanceMetrics } from '../types';

type ImportResult = Record<string, PerformanceMetrics>;

interface PerformanceImportProps {
  onImport: (data: ImportResult) => void;
  onError?: (message: string) => void;
}

const parseCsv = (text: string): ImportResult => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return {};
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
  const idxId = headers.indexOf('variantid');
  const idxCtr = headers.indexOf('ctr');
  const idxCvr = headers.indexOf('cvr');
  const idxCpa = headers.indexOf('cpa');
  const idxRoas = headers.indexOf('roas');
  if (idxId === -1) {
    throw new Error('CSV mist een "variantId"-kolom.');
  }

  const result: ImportResult = {};
  rows.forEach((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const id = cols[idxId];
    if (!id) return;
    const getNum = (idx: number) => (idx >= 0 && cols[idx] ? Number(cols[idx]) : undefined);
    result[id] = {
      ctr: getNum(idxCtr),
      cvr: getNum(idxCvr),
      cpa: getNum(idxCpa),
      roas: getNum(idxRoas),
    };
  });
  return result;
};

const PerformanceImport: React.FC<PerformanceImportProps> = ({ onImport, onError }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hint, setHint] = useState('CSV met kolommen: variantId, ctr, cvr, cpa, roas');

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseCsv(text);
      if (Object.keys(data).length === 0) {
        onError?.('Geen geldige rijen gevonden.');
        return;
      }
      onImport(data);
      setHint(`Geïmporteerd: ${Object.keys(data).length} regels`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kon CSV niet lezen.';
      onError?.(message);
    }
  };

  return (
    <section className="glass-panel performance-import" aria-label="Performance import">
      <div className="performance-import-header">
        <div>
          <p className="eyebrow">Performance import</p>
          <h3>CSV-upload</h3>
          <p className="section-subtitle">{hint}</p>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => inputRef.current?.click()}
        >
          Upload CSV
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <p className="performance-import-help">
        Voorbeeld: <code>variantId,ctr,cvr,cpa,roas</code> met ID's uit de variantcards.
        API-import is nog niet gekoppeld; CSV is de snelle route voor nu.
      </p>
    </section>
  );
};

export default PerformanceImport;
