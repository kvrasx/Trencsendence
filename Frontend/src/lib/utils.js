import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
