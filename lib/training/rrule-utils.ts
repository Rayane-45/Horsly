import type { RRule, RecurrenceFrequency, WeekDay } from "./types"

export function buildRRule(params: {
  freq: RecurrenceFrequency
  interval: number
  byDay?: WeekDay[]
  byMonthDay?: number
  bySetPos?: number
  count?: number
  until?: string
}): string {
  const parts: string[] = [`FREQ=${params.freq}`, `INTERVAL=${params.interval}`]

  if (params.byDay && params.byDay.length > 0) {
    parts.push(`BYDAY=${params.byDay.join(",")}`)
  }

  if (params.byMonthDay) {
    parts.push(`BYMONTHDAY=${params.byMonthDay}`)
  }

  if (params.bySetPos) {
    parts.push(`BYSETPOS=${params.bySetPos}`)
  }

  if (params.count) {
    parts.push(`COUNT=${params.count}`)
  } else if (params.until) {
    // Convert to UTC format YYYYMMDDTHHMMSSZ
    const date = new Date(params.until)
    const utcStr = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    parts.push(`UNTIL=${utcStr}`)
  }

  return parts.join(";")
}

export function parseRRule(rruleStr: string): Partial<RRule> {
  const parts = rruleStr.split(";")
  const rule: Partial<RRule> = {}

  parts.forEach((part) => {
    const [key, value] = part.split("=")
    switch (key) {
      case "FREQ":
        rule.freq = value as RecurrenceFrequency
        break
      case "INTERVAL":
        rule.interval = Number.parseInt(value, 10)
        break
      case "BYDAY":
        rule.byDay = value.split(",") as WeekDay[]
        break
      case "BYMONTHDAY":
        rule.byMonthDay = Number.parseInt(value, 10)
        break
      case "BYSETPOS":
        rule.bySetPos = Number.parseInt(value, 10)
        break
      case "COUNT":
        rule.count = Number.parseInt(value, 10)
        break
      case "UNTIL":
        // Parse YYYYMMDDTHHMMSSZ format
        const year = value.substring(0, 4)
        const month = value.substring(4, 6)
        const day = value.substring(6, 8)
        const hour = value.substring(9, 11)
        const minute = value.substring(11, 13)
        const second = value.substring(13, 15)
        rule.until = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
        break
    }
  })

  return rule
}

// Expand series to get next N occurrences (client-side preview)
export function expandSeriesPreview(startAt: string, rrule: string, timezone: string, maxOccurrences = 5): string[] {
  const parsed = parseRRule(rrule)
  const occurrences: string[] = []
  const start = new Date(startAt)

  if (!parsed.freq || !parsed.interval) return []

  let current = new Date(start)
  let count = 0

  while (count < maxOccurrences && count < (parsed.count || 1000)) {
    occurrences.push(current.toISOString())

    // Simple increment based on frequency
    switch (parsed.freq) {
      case "DAILY":
        current = new Date(current.getTime() + parsed.interval * 24 * 60 * 60 * 1000)
        break
      case "WEEKLY":
        current = new Date(current.getTime() + parsed.interval * 7 * 24 * 60 * 60 * 1000)
        break
      case "MONTHLY":
        current = new Date(current.setMonth(current.getMonth() + parsed.interval))
        break
    }

    count++

    if (parsed.until && current > new Date(parsed.until)) {
      break
    }
  }

  return occurrences
}

export function formatRecurrenceDescription(rrule: string): string {
  const parsed = parseRRule(rrule)

  if (!parsed.freq) return "Ponctuel"

  const interval = parsed.interval || 1
  const freqText =
    parsed.freq === "DAILY"
      ? interval === 1
        ? "Tous les jours"
        : `Tous les ${interval} jours`
      : parsed.freq === "WEEKLY"
        ? interval === 1
          ? "Toutes les semaines"
          : `Toutes les ${interval} semaines`
        : interval === 1
          ? "Tous les mois"
          : `Tous les ${interval} mois`

  let details = ""
  if (parsed.byDay && parsed.byDay.length > 0) {
    const dayNames: Record<WeekDay, string> = {
      MO: "Lun",
      TU: "Mar",
      WE: "Mer",
      TH: "Jeu",
      FR: "Ven",
      SA: "Sam",
      SU: "Dim",
    }
    details = ` le ${parsed.byDay.map((d) => dayNames[d]).join(", ")}`
  }

  let end = ""
  if (parsed.count) {
    end = ` (${parsed.count} fois)`
  } else if (parsed.until) {
    const date = new Date(parsed.until)
    end = ` jusqu'au ${date.toLocaleDateString("fr-FR")}`
  }

  return freqText + details + end
}
