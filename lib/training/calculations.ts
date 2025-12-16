import type { TrainingSession, HRZone } from "./types"

export function calculateTrainingLoad(
  durationSec: number,
  hrZones: Array<{ z: HRZone; sec: number }>,
  type: string,
): number {
  // TRIMP-like calculation
  const zoneWeights = { Z1: 1, Z2: 2, Z3: 3, Z4: 4, Z5: 5 }
  const disciplineFactors: Record<string, number> = {
    DRESSAGE: 0.7,
    CSO: 1.1,
    ENDURANCE: 1.2,
    EXTERIOR: 0.9,
    WESTERN: 1.0,
    DRIVING: 0.9,
    LEISURE: 0.7,
    LONGE: 0.8,
    RECOVERY: 0.5,
  }

  const baseLoad = hrZones.reduce((sum, zone) => {
    return sum + (zone.sec / 60) * zoneWeights[zone.z]
  }, 0)

  const factor = disciplineFactors[type] || 1.0
  return Math.round(baseLoad * factor)
}

export function detectGaits(
  points: Array<{ spd: number; t: string }>,
  thresholds: { walkMaxKmh: number; trotMaxKmh: number; canterMinKmh: number },
): { walkSec: number; trotSec: number; canterSec: number; haltSec: number } {
  let walkSec = 0
  let trotSec = 0
  let canterSec = 0
  let haltSec = 0

  for (let i = 0; i < points.length - 1; i++) {
    const speed = points[i].spd
    const nextTime = new Date(points[i + 1].t).getTime()
    const currentTime = new Date(points[i].t).getTime()
    const duration = (nextTime - currentTime) / 1000

    if (speed < 1) {
      haltSec += duration
    } else if (speed <= thresholds.walkMaxKmh) {
      walkSec += duration
    } else if (speed <= thresholds.trotMaxKmh) {
      trotSec += duration
    } else {
      canterSec += duration
    }
  }

  return {
    walkSec: Math.round(walkSec),
    trotSec: Math.round(trotSec),
    canterSec: Math.round(canterSec),
    haltSec: Math.round(haltSec),
  }
}

export function calculateHRZones(
  points: Array<{ hr: number; t: string }>,
  zones: Array<{ z: HRZone; min: number; max: number }>,
): Array<{ z: HRZone; sec: number }> {
  const zoneTimes: Record<HRZone, number> = { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 }

  for (let i = 0; i < points.length - 1; i++) {
    const hr = points[i].hr
    if (hr === 0) continue

    const nextTime = new Date(points[i + 1].t).getTime()
    const currentTime = new Date(points[i].t).getTime()
    const duration = (nextTime - currentTime) / 1000

    for (const zone of zones) {
      if (hr >= zone.min && hr <= zone.max) {
        zoneTimes[zone.z] += duration
        break
      }
    }
  }

  return Object.entries(zoneTimes).map(([z, sec]) => ({
    z: z as HRZone,
    sec: Math.round(sec),
  }))
}

export function calculateWeeklyLoad(sessions: TrainingSession[]): {
  currentWeek: number
  previousWeek: number
  change: number
  overload: boolean
} {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const currentWeek = sessions
    .filter((s) => s.status === "DONE" && new Date(s.end!) >= weekAgo)
    .reduce((sum, s) => sum + s.trainingLoad, 0)

  const previousWeek = sessions
    .filter((s) => s.status === "DONE" && new Date(s.end!) >= twoWeeksAgo && new Date(s.end!) < weekAgo)
    .reduce((sum, s) => sum + s.trainingLoad, 0)

  const change = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek) * 100 : 0
  const overload = change > 10 // More than 10% increase

  return { currentWeek, previousWeek, change, overload }
}

export function formatDuration(seconds: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return "0min"
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}`
  }
  return `${minutes}min`
}

export function formatDistance(meters: number): string {
  if (meters === undefined || meters === null || isNaN(meters)) {
    return "0 m"
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

export function formatSpeed(kmh: number): string {
  if (kmh === undefined || kmh === null || isNaN(kmh)) {
    return "0.0 km/h"
  }
  return `${kmh.toFixed(1)} km/h`
}
