import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseLocalDate(dateStr: string): Date {
  if (dateStr.length === 10) return new Date(dateStr + 'T00:00:00');
  return new Date(dateStr);
}
