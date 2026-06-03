import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

export function formatDatetime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: fr })
}

export function formatMonth(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM yyyy', { locale: fr })
}

export function calculateLigne(quantite: number, prixUnitaireHt: number, tauxTva: number) {
  const totalHt = parseFloat((quantite * prixUnitaireHt).toFixed(2))
  const totalTtc = parseFloat((totalHt * (1 + tauxTva / 100)).toFixed(2))
  return { totalHt, totalTtc }
}

export function calculateTotals(lignes: Array<{ totalHt: number; totalTtc: number }>) {
  const totalHt = parseFloat(lignes.reduce((sum, l) => sum + l.totalHt, 0).toFixed(2))
  const totalTtc = parseFloat(lignes.reduce((sum, l) => sum + l.totalTtc, 0).toFixed(2))
  const totalTva = parseFloat((totalTtc - totalHt).toFixed(2))
  return { totalHt, totalTva, totalTtc }
}
