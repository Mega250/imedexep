import { Platform } from "react-native";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; label: string }[]
): string {
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escape(row[c.key])).join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    console.warn(`[downloadCsv] not supported on platform=${Platform.OS}`);
    return;
  }
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function printCurrentDocument(): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  window.print();
}
