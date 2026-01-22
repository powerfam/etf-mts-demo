import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

export function formatPercent(num: number, decimals: number = 2): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

export function formatCurrency(num: number): string {
  if (num >= 1e12) {
    const value = num / 1e12
    return value >= 100 ? `${Math.round(value)}조` : `${value.toFixed(1)}조`
  } else if (num >= 1e8) {
    const value = num / 1e8
    return value >= 100 ? `${Math.round(value)}억` : `${value.toFixed(1)}억`
  } else if (num >= 1e4) {
    const value = num / 1e4
    return value >= 100 ? `${Math.round(value)}만` : `${value.toFixed(1)}만`
  }
  return formatNumber(num)
}
