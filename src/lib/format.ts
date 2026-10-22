import type { MessageKey } from "@/i18n"
import type { DrawStatus, PurchaseStatus, TransactionStatus, TransactionType } from "./types"

export function formatMoney(amount: string | number, currency?: string) {
  const value = typeof amount === "number" ? amount : Number(amount)
  if (Number.isNaN(value)) return String(amount)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
  return currency ? `${formatted} ${currency}` : formatted
}

export function formatDate(value: string, dateLocale = "en-GB") {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDay(value: string, dateLocale = "en-GB") {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function statusClass(status: TransactionStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "REJECTED":
      return "bg-destructive/10 text-destructive"
    case "CANCELLED":
      return "bg-muted text-muted-foreground"
  }
}

export function drawStatusClass(status: DrawStatus) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "DRAWN":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "CLOSED":
      return "bg-muted text-muted-foreground"
    case "DRAFT":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
}

export function purchaseStatusClass(status: PurchaseStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "REFUNDED":
      return "bg-muted text-muted-foreground"
  }
}

export function statusMessageKey(status: TransactionStatus): MessageKey {
  return `status.${status}`
}

export function typeMessageKey(type: TransactionType): MessageKey {
  return `type.${type}`
}

export function drawStatusMessageKey(status: DrawStatus): MessageKey {
  return `drawStatus.${status}`
}

export function purchaseStatusMessageKey(status: PurchaseStatus): MessageKey {
  return `purchaseStatus.${status}`
}
