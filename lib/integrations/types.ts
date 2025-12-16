export type NotifyPayload = {
  toEmail?: string
  toPhone?: string
  subject?: string
  text: string
  html?: string
}

export type OCRResult = {
  text: string
  parsed: {
    date: string | null
    total: string | null
    tax: string | null
    merchant: string | null
    items: Array<{ name: string; price: string }>
  }
  debug?: any
}

export type RegistryEquid = {
  ueln: string
  sire: string
  name: string
  birth_year: number
  sex: string
  breed: string
  color: string
  breeder: string
  country: string
  updated_at: string
}

export type HealthShareToken = {
  id: string
  horse_id: string
  owner_id: string
  scope: string
  expires_at: string
  created_at: string
}

export type GPSPoint = {
  lat: number
  lon: number
  ele?: number
  time: number
  speed?: number
  accuracy?: number
}

export type Gait = "idle" | "walk" | "trot" | "canter" | "gallop"

export type TrainingSession = {
  id: string
  horse_id: string
  start_time: string
  end_time?: string
  points: GPSPoint[]
  distance?: number
  duration?: number
  avg_speed?: number
  gait_breakdown?: Record<Gait, number>
}
