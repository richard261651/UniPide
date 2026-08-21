import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatShortDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function generateOrderCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${randomNum}`;
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail.includes('@') && cleanEmail.split('@')[1]?.includes('.');
}

export function isUninorteEmail(email: string): boolean {
  return isValidEmail(email);
}
