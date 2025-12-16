import type { Operation, OperationFilters } from "./types"

export function applyOperationFilters(operations: Operation[], filters: OperationFilters): Operation[] {
  return operations.filter((op) => {
    // Period filter
    if (filters.periodStart || filters.periodEnd) {
      const opDate = new Date(op.operationDate)
      if (filters.periodStart && opDate < new Date(filters.periodStart)) return false
      if (filters.periodEnd && opDate > new Date(filters.periodEnd)) return false
    }

    // Accounts filter
    if (filters.accounts && filters.accounts.length > 0) {
      if (!filters.accounts.includes(op.accountId)) return false
    }

    // Types filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(op.type)) return false
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      if (!op.categoryId || !filters.categories.includes(op.categoryId)) {
        if (!op.subcategoryId || !filters.categories.includes(op.subcategoryId)) {
          return false
        }
      }
    }

    // Horses filter
    if (filters.horses && filters.horses.length > 0) {
      if (!op.horseId || !filters.horses.includes(op.horseId)) return false
    }

    // Riders filter
    if (filters.riders && filters.riders.length > 0) {
      if (!op.riderId || !filters.riders.includes(op.riderId)) return false
    }

    // Sources filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(op.source)) return false
    }

    // Amount filter
    if (filters.amountMin !== undefined && op.amount < filters.amountMin) return false
    if (filters.amountMax !== undefined && op.amount > filters.amountMax) return false

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some((tag) => op.tags.includes(tag))
      if (!hasTag) return false
    }

    // Forecast filter
    if (filters.forecast !== undefined && op.forecast !== filters.forecast) return false

    // Reconciliation filter
    if (filters.reconciliation && op.reconciliation !== filters.reconciliation) return false

    // Attachments filter
    if (filters.hasAttachments !== undefined) {
      const hasAttachments = op.attachments.length > 0
      if (hasAttachments !== filters.hasAttachments) return false
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesLabel = op.label.toLowerCase().includes(searchLower)
      const matchesNote = op.note?.toLowerCase().includes(searchLower)
      const matchesPayee = op.payee?.toLowerCase().includes(searchLower)
      const matchesTags = op.tags.some((tag) => tag.toLowerCase().includes(searchLower))

      if (!matchesLabel && !matchesNote && !matchesPayee && !matchesTags) return false
    }

    return true
  })
}

export function sortOperations(
  operations: Operation[],
  sortBy: "date" | "amount" | "category" | "horse",
  order: "asc" | "desc" = "desc",
): Operation[] {
  const sorted = [...operations].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison = new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "category":
        comparison = (a.categoryId || "").localeCompare(b.categoryId || "")
        break
      case "horse":
        comparison = (a.horseId || "").localeCompare(b.horseId || "")
        break
    }

    return order === "asc" ? comparison : -comparison
  })

  return sorted
}
