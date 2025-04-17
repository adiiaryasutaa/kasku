import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToSlug(text: string) {
  return text.toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
