import type { Operation, Category, Account } from "./types"

export function exportToCSV(operations: Operation[], categories: Category[], accounts: Account[]): string {
  const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return ""
    const category = categories.find((c) => c.id === categoryId)
    return category?.label || ""
  }

  const getAccountLabel = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.label || ""
  }

  // CSV Header
  const headers = [
    "Date",
    "Libellé",
    "Catégorie",
    "Sous-catégorie",
    "Compte",
    "Type",
    "Montant",
    "Devise",
    "Cheval",
    "Bénéficiaire",
    "Moyen de paiement",
    "Tags",
    "Note",
    "Source",
    "Statut",
  ]

  // CSV Rows
  const rows = operations.map((op) => [
    new Date(op.operationDate).toLocaleDateString("fr-FR"),
    op.label,
    getCategoryLabel(op.categoryId),
    getCategoryLabel(op.subcategoryId),
    getAccountLabel(op.accountId),
    op.type,
    op.amount.toFixed(2),
    op.currency,
    op.horseId || "",
    op.payee || "",
    op.paymentMethod || "",
    op.tags.join("; "),
    op.note || "",
    op.source,
    op.status,
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}

export function downloadCSV(
  operations: Operation[],
  categories: Category[],
  accounts: Account[],
  filename = "budget-export.csv",
) {
  const csv = exportToCSV(operations, categories, accounts)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateExportSummary(operations: Operation[]): {
  totalExpenses: number
  totalIncome: number
  totalRefunds: number
  netBalance: number
  operationCount: number
  periodStart: string
  periodEnd: string
} {
  const expenses = operations.filter((op) => op.type === "EXPENSE")
  const income = operations.filter((op) => op.type === "INCOME")
  const refunds = operations.filter((op) => op.type === "REFUND")

  const totalExpenses = expenses.reduce((sum, op) => sum + op.amount, 0)
  const totalIncome = income.reduce((sum, op) => sum + op.amount, 0)
  const totalRefunds = refunds.reduce((sum, op) => sum + op.amount, 0)

  const dates = operations.map((op) => new Date(op.operationDate).getTime())
  const periodStart = new Date(Math.min(...dates)).toLocaleDateString("fr-FR")
  const periodEnd = new Date(Math.max(...dates)).toLocaleDateString("fr-FR")

  return {
    totalExpenses,
    totalIncome,
    totalRefunds,
    netBalance: totalIncome + totalRefunds - totalExpenses,
    operationCount: operations.length,
    periodStart,
    periodEnd,
  }
}
