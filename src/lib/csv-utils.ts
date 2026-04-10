import Papa from "papaparse";

export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
  rawData: string[][];
}

export interface ColumnStats {
  name: string;
  type: "numeric" | "categorical" | "date" | "text";
  count: number;
  missing: number;
  missingPct: number;
  unique: number;
  // numeric
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  std?: number;
  // categorical
  topValues?: { value: string; count: number }[];
}

export interface DataInsight {
  icon: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success";
}

export function parseCSV(file: File): Promise<CSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        const rawData = rows.map((r) => headers.map((h) => r[h] || ""));
        resolve({ headers, rows, rawData });
      },
      error: (err) => reject(err),
    });
  });
}

function isNumeric(val: string): boolean {
  if (!val || val.trim() === "") return false;
  return !isNaN(Number(val));
}

function isDate(val: string): boolean {
  if (!val || val.trim() === "") return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && val.length > 4;
}

export function analyzeColumn(name: string, values: string[]): ColumnStats {
  const nonEmpty = values.filter((v) => v != null && v.trim() !== "");
  const missing = values.length - nonEmpty.length;
  const unique = new Set(nonEmpty).size;

  const numericValues = nonEmpty.filter(isNumeric).map(Number);
  const isNumCol = numericValues.length > nonEmpty.length * 0.7;
  const isDateCol = !isNumCol && nonEmpty.filter(isDate).length > nonEmpty.length * 0.7;
  const isCategorical = !isNumCol && !isDateCol && unique <= Math.min(50, nonEmpty.length * 0.5);

  const type: ColumnStats["type"] = isNumCol ? "numeric" : isDateCol ? "date" : isCategorical ? "categorical" : "text";

  const stats: ColumnStats = {
    name,
    type,
    count: values.length,
    missing,
    missingPct: Math.round((missing / values.length) * 100),
    unique,
  };

  if (type === "numeric" && numericValues.length > 0) {
    const sorted = [...numericValues].sort((a, b) => a - b);
    const sum = numericValues.reduce((a, b) => a + b, 0);
    stats.mean = Math.round((sum / numericValues.length) * 100) / 100;
    stats.median = sorted[Math.floor(sorted.length / 2)];
    stats.min = sorted[0];
    stats.max = sorted[sorted.length - 1];
    const variance = numericValues.reduce((acc, v) => acc + (v - stats.mean!) ** 2, 0) / numericValues.length;
    stats.std = Math.round(Math.sqrt(variance) * 100) / 100;
  }

  if (type === "categorical") {
    const freq: Record<string, number> = {};
    nonEmpty.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
    stats.topValues = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
  }

  return stats;
}

export function generateInsights(data: CSVData, columnStats: ColumnStats[]): DataInsight[] {
  const insights: DataInsight[] = [];

  insights.push({
    icon: "📊",
    title: `${data.rows.length} lignes × ${data.headers.length} colonnes`,
    description: "Dimensions de votre dataset",
    type: "info",
  });

  const numericCols = columnStats.filter((c) => c.type === "numeric");
  const categoricalCols = columnStats.filter((c) => c.type === "categorical");

  if (numericCols.length > 0) {
    insights.push({
      icon: "🔢",
      title: `${numericCols.length} colonnes numériques détectées`,
      description: numericCols.map((c) => c.name).join(", "),
      type: "success",
    });
  }

  if (categoricalCols.length > 0) {
    insights.push({
      icon: "🏷️",
      title: `${categoricalCols.length} colonnes catégorielles`,
      description: categoricalCols.map((c) => c.name).join(", "),
      type: "info",
    });
  }

  const missingCols = columnStats.filter((c) => c.missingPct > 0);
  if (missingCols.length > 0) {
    const worst = missingCols.sort((a, b) => b.missingPct - a.missingPct)[0];
    insights.push({
      icon: "⚠️",
      title: `${missingCols.length} colonnes avec valeurs manquantes`,
      description: `"${worst.name}" a le plus de manquants (${worst.missingPct}%)`,
      type: "warning",
    });
  } else {
    insights.push({
      icon: "✅",
      title: "Aucune valeur manquante !",
      description: "Votre dataset est complet",
      type: "success",
    });
  }

  const highCardinality = columnStats.filter((c) => c.type === "text" && c.unique > 100);
  if (highCardinality.length > 0) {
    insights.push({
      icon: "🔍",
      title: "Colonnes à haute cardinalité",
      description: `${highCardinality.map((c) => c.name).join(", ")} — possiblement des identifiants`,
      type: "info",
    });
  }

  if (numericCols.length >= 2) {
    insights.push({
      icon: "🔮",
      title: "Prédiction disponible",
      description: "Vous pouvez lancer une régression linéaire sur vos données numériques",
      type: "success",
    });
  }

  return insights;
}

// Simple linear regression
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number; predictions: number[] } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const predictions = x.map((xi) => slope * xi + intercept);

  const meanY = sumY / n;
  const ssRes = y.reduce((a, yi, i) => a + (yi - predictions[i]) ** 2, 0);
  const ssTot = y.reduce((a, yi) => a + (yi - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.round((1 - ssRes / ssTot) * 10000) / 10000;

  return { slope: Math.round(slope * 10000) / 10000, intercept: Math.round(intercept * 10000) / 10000, r2, predictions };
}
