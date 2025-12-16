export type Currency = "EUR" | "USD" | "GBP"

export type AccountType = "CURRENT" | "SAVINGS" | "CASH" | "HEALTH" | "OTHER"

export type OperationType = "EXPENSE" | "INCOME" | "TRANSFER" | "REFUND"

export type OperationSource = "MANUAL" | "IMPORT" | "HEALTH" | "TRAINING" | "BANK_API"

export type ReconciliationStatus = "NONE" | "MATCHED" | "EXCLUDED"

export type OperationStatus = "OK" | "PARTIALLY_REFUNDED" | "FULLY_REFUNDED"

export type PaymentMethod = "CARD" | "TRANSFER" | "CASH" | "CHECK" | "OTHER"

export type BudgetScope = "GLOBAL" | "CATEGORY" | "SUBCATEGORY" | "HORSE" | "HORSE_CATEGORY"

export type Periodicity = "MONTHLY" | "WEEKLY" | "QUARTERLY" | "YEARLY"

export type RuleOperator = "EQUALS" | "CONTAINS" | "BETWEEN" | "GREATER_THAN" | "LESS_THAN"

export type RuleActionType = "SET_CATEGORY" | "ADD_TAG" | "SET_RECONCILIATION" | "SET_RIDER"

export interface Account {
  id: string
  label: string
  type: AccountType
  currency: Currency
  color: string
  openingBalance: number
  openingDate: string
  displayOrder: number
  active: boolean
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  parentId?: string
  label: string
  icon?: string
  color: string
  healthLinked: boolean
  trainingLinked: boolean
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  mime: string
  size: number
}

export interface Operation {
  id: string
  accountId: string
  horseId?: string
  riderId?: string
  type: OperationType
  amount: number
  currency: Currency
  operationDate: string
  valueDate?: string
  label: string
  categoryId?: string
  subcategoryId?: string
  note?: string
  payee?: string
  paymentMethod?: PaymentMethod
  attachments: Attachment[]
  tags: string[]
  source: OperationSource
  reconciliation: ReconciliationStatus
  splitOf?: string
  externalRef?: string
  forecast: boolean
  status: OperationStatus
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface BudgetEnvelope {
  id: string
  scope: BudgetScope
  horseId?: string
  categoryId?: string
  periodicity: Periodicity
  amount: number
  carryOver: boolean
  locked: boolean
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface RuleCondition {
  field: string
  op: RuleOperator
  value?: string
  min?: number
  max?: number
}

export interface RuleAction {
  type: RuleActionType
  categoryId?: string
  value?: string
  riderId?: string
}

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  priority: number
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: string
  updatedAt: string
}

export interface ForecastAssumption {
  categoryId: string
  annualAmount: number
  horseId?: string
}

export interface ForecastEvent {
  id: string
  date: string
  label: string
  amount: number
  horseId?: string
  type: OperationType
}

export interface Scenario {
  id: string
  label: string
  year: number
  base: "COPY_LAST_YEAR" | "RECURRING_ONLY" | "EMPTY"
  inflationPct: number
  assumptions: ForecastAssumption[]
  events: ForecastEvent[]
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface OperationFilters {
  periodStart?: string
  periodEnd?: string
  accounts?: string[]
  types?: OperationType[]
  categories?: string[]
  horses?: string[]
  riders?: string[]
  sources?: OperationSource[]
  amountMin?: number
  amountMax?: number
  tags?: string[]
  forecast?: boolean
  reconciliation?: ReconciliationStatus
  hasAttachments?: boolean
  search?: string
}
