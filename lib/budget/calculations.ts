import type { Operation, BudgetEnvelope, Account } from "./types"

export function calculateAccountBalance(account: Account, operations: Operation[]): number {
  const accountOps = operations.filter(
    (op) => op.accountId === account.id && !op.forecast && op.reconciliation !== "EXCLUDED",
  )

  const balance = accountOps.reduce((sum, op) => {
    switch (op.type) {
      case "EXPENSE":
        return sum - op.amount
      case "INCOME":
      case "REFUND":
        return sum + op.amount
      case "TRANSFER":
        // Handle transfers based on account
        return sum
      default:
        return sum
    }
  }, account.openingBalance)

  return balance
}

export function calculateForecastBalance(account: Account, operations: Operation[]): number {
  const currentBalance = calculateAccountBalance(account, operations)
  const forecastOps = operations.filter((op) => op.accountId === account.id && op.forecast)

  const forecastBalance = forecastOps.reduce((sum, op) => {
    switch (op.type) {
      case "EXPENSE":
        return sum - op.amount
      case "INCOME":
      case "REFUND":
        return sum + op.amount
      default:
        return sum
    }
  }, currentBalance)

  return forecastBalance
}

export function calculateEnvelopeConsumption(
  envelope: BudgetEnvelope,
  operations: Operation[],
  periodStart: Date,
  periodEnd: Date,
): { consumed: number; remaining: number; percentage: number; exceeded: boolean } {
  const relevantOps = operations.filter((op) => {
    const opDate = new Date(op.operationDate)
    if (opDate < periodStart || opDate > periodEnd) return false
    if (op.type !== "EXPENSE") return false
    if (op.reconciliation === "EXCLUDED") return false
    if (op.forecast) return false

    // Filter by scope
    if (envelope.scope === "CATEGORY" && op.categoryId !== envelope.categoryId) return false
    if (envelope.scope === "HORSE" && op.horseId !== envelope.horseId) return false
    if (envelope.scope === "HORSE_CATEGORY") {
      if (op.horseId !== envelope.horseId || op.categoryId !== envelope.categoryId) return false
    }

    return true
  })

  const consumed = relevantOps.reduce((sum, op) => sum + op.amount, 0)
  const remaining = Math.max(0, envelope.amount - consumed)
  const percentage = envelope.amount > 0 ? (consumed / envelope.amount) * 100 : 0
  const exceeded = consumed > envelope.amount

  return { consumed, remaining, percentage, exceeded }
}

export function calculateCategoryTotal(
  categoryId: string,
  operations: Operation[],
  periodStart?: Date,
  periodEnd?: Date,
): number {
  return operations
    .filter((op) => {
      if (op.categoryId !== categoryId && op.subcategoryId !== categoryId) return false
      if (op.type !== "EXPENSE") return false
      if (op.reconciliation === "EXCLUDED") return false
      if (op.forecast) return false

      if (periodStart && periodEnd) {
        const opDate = new Date(op.operationDate)
        if (opDate < periodStart || opDate > periodEnd) return false
      }

      return true
    })
    .reduce((sum, op) => sum + op.amount, 0)
}

export function calculateHorseTotal(
  horseId: string,
  operations: Operation[],
  periodStart?: Date,
  periodEnd?: Date,
): number {
  return operations
    .filter((op) => {
      if (op.horseId !== horseId) return false
      if (op.type !== "EXPENSE") return false
      if (op.reconciliation === "EXCLUDED") return false
      if (op.forecast) return false

      if (periodStart && periodEnd) {
        const opDate = new Date(op.operationDate)
        if (opDate < periodStart || opDate > periodEnd) return false
      }

      return true
    })
    .reduce((sum, op) => sum + op.amount, 0)
}

export function calculateHealthNetCost(operations: Operation[]): {
  gross: number
  refunds: number
  net: number
  pending: number
} {
  const healthOps = operations.filter((op) => op.source === "HEALTH" && !op.forecast)

  const expenses = healthOps.filter((op) => op.type === "EXPENSE")
  const refunds = healthOps.filter((op) => op.type === "REFUND")

  const gross = expenses.reduce((sum, op) => sum + op.amount, 0)
  const refundsTotal = refunds.reduce((sum, op) => sum + op.amount, 0)
  const net = gross - refundsTotal

  // Calculate pending refunds (expenses not fully refunded)
  const pending = expenses
    .filter((op) => op.status === "OK" || op.status === "PARTIALLY_REFUNDED")
    .reduce((sum, op) => {
      // Find related refunds
      const relatedRefunds = refunds.filter((r) => r.externalRef === op.externalRef)
      const refunded = relatedRefunds.reduce((s, r) => s + r.amount, 0)
      return sum + Math.max(0, op.amount - refunded)
    }, 0)

  return { gross, refunds: refundsTotal, net, pending }
}

export function calculateBurnRate(operations: Operation[], days = 30): number {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentExpenses = operations.filter((op) => {
    if (op.type !== "EXPENSE") return false
    if (op.reconciliation === "EXCLUDED") return false
    if (op.forecast) return false

    const opDate = new Date(op.operationDate)
    return opDate >= cutoffDate
  })

  const total = recentExpenses.reduce((sum, op) => sum + op.amount, 0)
  return total / days
}

export function getUncategorizedOperations(operations: Operation[]): Operation[] {
  return operations.filter((op) => !op.categoryId && !op.forecast && op.reconciliation !== "EXCLUDED")
}

export function calculatePeriodSummary(
  operations: Operation[],
  periodStart: Date,
  periodEnd: Date,
): {
  totalExpenses: number
  totalIncome: number
  totalRefunds: number
  netBalance: number
  operationCount: number
  categoriesUsed: number
  uncategorized: number
} {
  const periodOps = operations.filter((op) => {
    const opDate = new Date(op.operationDate)
    return opDate >= periodStart && opDate <= periodEnd && !op.forecast && op.reconciliation !== "EXCLUDED"
  })

  const expenses = periodOps.filter((op) => op.type === "EXPENSE")
  const income = periodOps.filter((op) => op.type === "INCOME")
  const refunds = periodOps.filter((op) => op.type === "REFUND")

  const totalExpenses = expenses.reduce((sum, op) => sum + op.amount, 0)
  const totalIncome = income.reduce((sum, op) => sum + op.amount, 0)
  const totalRefunds = refunds.reduce((sum, op) => sum + op.amount, 0)
  const netBalance = totalIncome + totalRefunds - totalExpenses

  const categoriesSet = new Set(periodOps.filter((op) => op.categoryId).map((op) => op.categoryId))
  const categoriesUsed = categoriesSet.size

  const uncategorized = periodOps.filter((op) => !op.categoryId).length

  return {
    totalExpenses,
    totalIncome,
    totalRefunds,
    netBalance,
    operationCount: periodOps.length,
    categoriesUsed,
    uncategorized,
  }
}
