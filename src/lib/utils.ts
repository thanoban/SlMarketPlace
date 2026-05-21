import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDatetime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function cloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string } = {}
) {
  if (!url || !url.includes("cloudinary.com")) return url;
  const { width = 800, height = 400, crop = "fill" } = options;
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_${crop},q_auto,f_auto/`
  );
}
