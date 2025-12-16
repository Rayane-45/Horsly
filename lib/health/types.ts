// Core Health System Types for Cavaly

export type HorseProfile = "FOAL" | "ADULT" | "SENIOR" | "PREGNANT_MARE" | "ATHLETE"

export type PractitionerType = "VET" | "DENTIST" | "FARRIER" | "OSTEO" | "PHYSIO" | "OTHER"

export type HealthEventCategory =
  | "VACCINE"
  | "DEWORM"
  | "FARRIER"
  | "DENTAL"
  | "VET_VISIT"
  | "SURGERY"
  | "MEDICATION"
  | "CHECKUP"
  | "INJURY"
  | "HYGIENE"
  | "NUTRITION"
  | "OTHER"

export type HealthEventStatus = "PLANNED" | "DONE" | "CANCELED" | "OVERDUE"

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export type RecurrenceType =
  | "NONE"
  | "WEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "ANNUAL"
  | "CUSTOM"

export type VaccineType = "FLU" | "TETANUS" | "RABIES" | "WNV" | "RHINO" | "OTHER"

export type ObservationType = "NOTE" | "SYMPTOM" | "ENVIRONMENT" | "FEEDING" | "WATERING" | "BEHAVIOR"

export type DocumentType = "PRESCRIPTION" | "LAB" | "IMAGING" | "INVOICE" | "OTHER"

export type RecommendationCategory = "DAILY" | "PERIODIC" | "SEASONAL" | "EMERGENCY" | "NUTRITION" | "HYGIENE"

export type RecommendationAction = "PLAN_EVENT" | "MARK_DONE" | "READ_MORE" | "IGNORE"

export interface Practitioner {
  id: string
  type: PractitionerType
  name: string
  phone?: string
  email?: string
  notes?: string
  clubId?: string
}

export interface HealthEvent {
  id: string
  horseId: string
  category: HealthEventCategory
  label: string
  plannedDate?: string
  doneDate?: string
  status: HealthEventStatus
  priority: Priority
  practitionerId?: string
  cost: number
  currency: string
  budgetLinked: boolean
  budgetOperationId?: string
  attachments: Array<{
    id: string
    name: string
    url: string
    mime: string
    size: number
  }>
  notes?: string
  source: "USER" | "RULE" | "RECOMMENDER" | "IMPORT" | "TRAINING_OBS"
  recurrence: {
    type: RecurrenceType
    interval: number
    until?: string
  }
  externalRef?: string
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface VaccinationRecord {
  id: string
  horseId: string
  vaccineType: VaccineType
  date: string
  lotNumber?: string
  practitionerId?: string
  documentId?: string
  nextDueDate?: string
  createdAt: string
}

export interface DewormingRecord {
  id: string
  horseId: string
  date: string
  product?: string
  molecule?: string
  dose?: string
  coproBefore?: {
    date?: string
    result?: "LOW" | "MEDIUM" | "HIGH"
  }
  nextDueDate?: string
  createdAt: string
}

export interface VitalSigns {
  id: string
  horseId: string
  date: string
  weightKg?: number
  bcs?: number // Body Condition Score 1-9
  temperatureC?: number
  heartBpm?: number
  respBpm?: number
  lamenessScore?: number // 0-5
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Observation {
  id: string
  horseId: string
  date: string
  type: ObservationType
  text: string
  attachments: Array<{
    id: string
    name: string
    url: string
  }>
  createdBy: string
  createdAt: string
  priority: Priority
}

export interface HealthDocument {
  id: string
  horseId: string
  type: DocumentType
  name: string
  url: string
  mime: string
  size: number
  createdAt: string
}

export interface Recommendation {
  id: string
  horseId: string
  title: string
  detail: string
  category: RecommendationCategory
  priority: Priority
  suggestedDate?: string
  action: RecommendationAction
  basedOn: Array<"PROFILE" | "SEASON" | "VITALS" | "HISTORY" | "LOCATION" | "WEATHER">
  feedback?: "UP" | "DOWN"
  createdAt: string
}

export interface HealthSettings {
  horseId: string
  notifications: {
    reminders: boolean
    tips: boolean
    weeklyReport: boolean
    monthlyReport: boolean
    quietHours: {
      from: string
      to: string
    }
  }
  calendarSync: {
    google: boolean
    ical: boolean
  }
  sensitivity: {
    tempHigh: number
    weightLossPct: number
  }
  share: Array<{
    userId: string
    role: "VET_COLLAB" | "TRAINER" | "OWNER_READ"
  }>
  createdAt: string
  updatedAt: string
}

export interface HealthDashboard {
  vaccineStatus: "OK" | "WARNING" | "OVERDUE"
  dewormStatus: "OK" | "WARNING" | "OVERDUE"
  upcomingEvents: HealthEvent[]
  recentVitals: VitalSigns | null
  pendingRecommendations: number
  overdueCount: number
}
