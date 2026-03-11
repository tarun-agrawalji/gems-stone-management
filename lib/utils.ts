import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}


export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    IN_STOCK: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    IN_PROCESS: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    READY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PARTIALLY_SOLD: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    CLOSED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    RETURNED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    PENDING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CLOSED_RETURNED: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    IN_STOCK: "In Stock",
    IN_PROCESS: "In Process",
    READY: "Ready",
    PARTIALLY_SOLD: "Partially Sold",
    CLOSED: "Closed",
    RETURNED: "Returned",
    PENDING: "Pending",
    CLOSED_RETURNED: "Closed – Returned",
  };
  return map[status] || status;
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    ROUGH: "Rough",
    READY_GOODS: "Ready Goods",
    BY_ORDER: "By Order",
  };
  return map[cat] || cat;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
