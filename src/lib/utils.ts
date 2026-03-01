import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

export function calculateROAS(revenue: number, spend: number) {
  if (spend === 0) return 0;
  return (revenue / spend).toFixed(2);
}

export function calculateAvgBill(sales: number, orders: number) {
  if (orders === 0) return 0;
  return (sales / orders).toFixed(2);
}
