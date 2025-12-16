export type ActionCardDomain = "training" | "health" | "budget"
export type ActionCardSeverity = "info" | "advice" | "warning" | "critical"
export type ActionCardSource = "rules" | "ml" | "llm"

export interface ActionCard {
  id: string
  domain: ActionCardDomain
  severity: ActionCardSeverity
  title: string
  subtitle?: string
  explanation: string
  source: ActionCardSource
  references?: string[] // Guide passage IDs
  actions: Array<{
    label: string
    deeplink: string
    payload?: any
  }>
  createdAt: Date
  expiresAt?: Date
}

export interface HorseFeatures {
  horseId: string
  age: number
  discipline: "dressage" | "cso" | "cce" | "endurance" | "western" | "attelage" | "loisir"
  workloadLast4w: number // hours
  lastHardWorkAt?: Date
  weeklyLoad: number // TRIMP score
  tendonRiskFlag: boolean
  injuries?: string[]
  temperament: "sanguin" | "lymphatique" | "nerveux" | "equilibre"
}

export interface WeatherContext {
  date: Date
  tempC: number
  humidity: number
  heatIndex: number
  ground: "soft" | "good" | "hard" | "frozen" | "wet"
}

export interface TrainingPlan {
  horseId: string
  weeks: number
  discipline: string
  microcycles: Array<{
    weekIndex: number
    focus: "foncier" | "technique" | "recup"
    sessions: Array<{
      day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
      type: string
      durationMin: number
      intensity: "low" | "mod" | "high"
      notes: string
      recurrence?: string
    }>
  }>
}

export interface Reminder {
  id: string
  horseId: string
  type: "vaccine" | "deworming" | "farrier" | "dental" | "osteo"
  dueAt: Date
  window: { start: Date; end: Date }
  priority: "low" | "medium" | "high"
  notes: string
}

export interface BudgetInsight {
  type: "anomaly" | "recurring_missing" | "forecast" | "optimization"
  title: string
  description: string
  amount?: number
  category?: string
  actionable: boolean
}
