export type SessionType =
  | "DRESSAGE"
  | "EXTERIOR"
  | "ENDURANCE"
  | "CSO"
  | "LEISURE"
  | "WESTERN"
  | "DRIVING"
  | "LONGE"
  | "RECOVERY"

export type SessionMode = "MOUNTED" | "IN_HAND" | "DRIVING"

export type SessionStatus = "PLANNED" | "ACTIVE" | "DONE" | "CANCELED"

export type Intensity = "EASY" | "MODERATE" | "HARD" | "MAX"

export type Surface = "ARENA_SAND" | "GRASS" | "TRACK" | "ROAD" | "TRAIL" | "MIXED" | null

export type HRZone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5"

export type IntervalType = "WORK" | "RECOVERY" | "SPRINT" | "HILL"

export type Source = "MANUAL" | "WATCH" | "PHONE_GPS" | "IMPORT_GPX" | "API"

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY"

export type WeekDay = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU"

export interface RRule {
  freq: RecurrenceFrequency
  interval: number
  byDay?: WeekDay[]
  byMonthDay?: number
  bySetPos?: number // For "2nd Tuesday" type rules
  count?: number
  until?: string
}

export interface TrainingSession {
  id: string
  horseId: string
  title: string
  type: SessionType
  mode: SessionMode
  status: SessionStatus
  plannedStart: string | null
  plannedEnd: string | null
  start: string | null
  end: string | null
  durationSec: number
  distanceM: number
  elevationPosM: number
  avgSpeedKmh: number
  maxSpeedKmh: number
  gpsTrackId: string | null
  hrAvgBpm: number
  hrMaxBpm: number
  hrZones: Array<{ z: HRZone; sec: number }>
  gaits: {
    walkSec: number
    trotSec: number
    canterSec: number
    haltSec: number
  }
  intervals: Array<{
    start: string
    end: string
    label: IntervalType
    notes: string | null
  }>
  calories: {
    horseKcal: number
    riderKcal: number
  }
  intensity: Intensity
  trainingLoad: number
  rpe: number // 1-10 effort perçu
  surface: Surface
  weather: {
    tempC: number
    humidity: number
    windKph: number
    conditions: string | null
  } | null
  notes: string | null
  attachments: Array<{
    id: string
    name: string
    url: string
    mime: string
    size: number
  }>
  cost: number
  currency: string
  budgetLinked: boolean
  budgetOperationId: string | null
  shareableImageId: string | null
  source: Source
  externalRef: string | null
  clubId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TrainingTrack {
  id: string
  sessionId: string
  format: "GPX" | "JSON"
  points: Array<{
    t: string
    lat: number
    lng: number
    elev: number
    spd: number
    hr: number
    cad: number
  }>
  summary: {
    samples: number
    gaps: number
    avgHdop: number
  }
  storage: {
    url: string
    bytes: number
    checksum: string
  }
  createdAt: string
}

export interface TrainingSettings {
  horseId: string
  watchIntegration: {
    appleHealth: boolean
    allowBackground: boolean
  }
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
  gaitThresholds: {
    walkMaxKmh: number
    trotMaxKmh: number
    canterMinKmh: number
  }
  hrZones: Array<{
    z: HRZone
    min: number
    max: number
  }>
  loadModel: {
    method: "TRIMP" | "CAVALY"
    alpha: number
  }
  calendarSync: {
    google: boolean
    ical: boolean
  }
  shareDefaultHashtags: string[]
  createdAt: string
  updatedAt: string
}

export interface TrainingRecommendation {
  id: string
  horseId: string
  title: string
  detail: string
  category: "DAILY" | "WEEKLY" | "PERIODIC" | "RECOVERY" | "PERFORMANCE" | "PREVENTION"
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  suggestedDate: string | null
  action: "PLAN_SESSION" | "ADJUST_INTENSITY" | "READ_MORE" | "IGNORE"
  basedOn: Array<"PROFILE" | "DISCIPLINE" | "SEASON" | "HEALTH" | "HISTORY" | "WEATHER" | "SCIENCE_RULES">
  feedback: "UP" | "DOWN" | null
  createdAt: string
}

export interface TrainingExport {
  id: string
  horseId: string | null
  scope: "SESSION" | "PERIOD"
  filters: {
    from: string
    to: string
    type: SessionType[]
    clubId: string | null
  }
  format: "GPX" | "CSV" | "XLSX" | "PDF_SUMMARY" | "SOCIAL_IMAGE"
  status: "PENDING" | "DONE" | "FAILED"
  file: {
    url: string
    size: number
    mime: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface TrainingShareImage {
  id: string
  sessionId: string
  url: string
  width: number
  height: number
  theme: "LIGHT" | "DARK" | "AUTO"
  createdAt: string
}

export interface TrainingSeries {
  id: string
  ownerId: string
  stableId: string | null
  title: string
  type: SessionType
  defaultIntensity: Intensity
  defaultDurationMin: number
  defaultDistanceKm: number | null
  notes: string | null
  timezone: string // IANA timezone (e.g., "Europe/Paris")
  startAt: string // First occurrence (timestamptz)
  rrule: string // RFC 5545 RRULE string
  until: string | null
  count: number | null
  skipHolidays: boolean
  createdAt: string
  updatedAt: string
}

export interface TrainingSeriesHorse {
  seriesId: string
  horseId: string
  primary: boolean
}

export interface TrainingOccurrence {
  id: string
  seriesId: string | null
  horseId: string
  startAt: string
  endAt: string | null
  status: "PLANNED" | "DONE" | "CANCELED"
  movedFrom: string | null // Original date if moved
  durationMin: number | null // Override
  distanceKm: number | null // Override
  avgSpeedKmh: number | null
  intensity: Intensity | null // Override
  coach: string | null
  notes: string | null
  gpxUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CalendarView = "MONTH" | "WEEK" | "DAY"

export interface CalendarFilters {
  horseIds: string[]
  types: SessionType[]
  coaches: string[]
  statuses: ("PLANNED" | "DONE" | "CANCELED")[]
}

export interface CalendarOccurrence {
  id: string
  seriesId: string | null
  seriesTitle: string | null
  horseId: string
  horseName: string
  startAt: string
  endAt: string | null
  type: SessionType
  intensity: Intensity
  status: "PLANNED" | "DONE" | "CANCELED"
  isVirtual: boolean // True if from series expansion, false if concrete occurrence
  coach: string | null
  notes: string | null
}

export type LiveSessionState =
  | "IDLE"
  | "PERMISSION_CHECK"
  | "ACQUIRING_GPS"
  | "READY"
  | "RUNNING"
  | "RUNNING_DEGRADED"
  | "PAUSED"
  | "PAUSED_AUTO"
  | "SAVING"
  | "FINISHED"
  | "ERROR_PERMISSIONS"
  | "ERROR_GPS_TIMEOUT"
  | "ERROR_SAVE"

export interface GpsSample {
  ts: number
  lat: number
  lng: number
  accuracy: number
  speed?: number
  altitude?: number
  hr?: number
}

export interface LiveConfig {
  horseId: string
  type: SessionType
  goal?: string
  autoPause: boolean
  gaitDetection: boolean
  sosShare: boolean
}

export interface LiveSession {
  id: string
  state: LiveSessionState
  config: LiveConfig
  samples: GpsSample[]
  stats: {
    elapsedMs: number
    distanceM: number
    avgSpeed: number
    elevGainM?: number
  }
  lastFix?: {
    lat: number
    lng: number
    accuracy: number
    provider?: "gps" | "network"
  }
  startedAt?: string
  pausedAt?: string
  stoppedAt?: string
}

export interface PrepState {
  horseId: string | null
  sessionType: SessionType
  goalType: "DISTANCE" | "DURATION" | "NONE" | null
  goalValue: number | null
  autoPause: boolean
  gaitDetection: boolean
  safetyShare: boolean
  lastPosition: { lat: number; lng: number } | null
}
