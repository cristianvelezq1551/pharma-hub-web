import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiError } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

export function getFinalPrice(price: number, discount: number): number {
  if (!discount) return price;
  return price * (1 - discount / 100);
}

export function getApiErrorMessage(error: unknown): string {
  const e = error as { response?: { data?: ApiError } };
  const msg = e?.response?.data?.message;
  if (!msg) return 'Error inesperado';
  return Array.isArray(msg) ? msg[0] : msg;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  DISPATCHED: 'Despachado',
  DELIVERED: 'Entregado',
  REJECTED: 'Rechazado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  DISPATCHED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};
