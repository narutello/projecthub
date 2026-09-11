import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  "web",
  "mobile",
  "cli",
  "library",
  "design",
  "other",
] as const;

export const STATUSES = ["live", "in_progress", "archived"] as const;

export type Category = (typeof CATEGORIES)[number];
export type ProjectStatus = (typeof STATUSES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isStatus(value: string): value is ProjectStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string, locale: "en" | "fa"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function localized(
  locale: "en" | "fa",
  en: string,
  fa?: string | null,
): string {
  if (locale === "fa" && fa && fa.trim()) return fa;
  return en;
}

export async function compressImage(
  file: File,
  maxWidth = 1400,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 900_000) {
    return canvas.toDataURL("image/jpeg", 0.68);
  }
  return dataUrl;
}
