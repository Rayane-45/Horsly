import type { HealthEvent, VaccinationRecord, DewormingRecord, VitalSigns, HealthDashboard } from "./types"

export function calculateHealthDashboard(
  events: HealthEvent[],
  vaccinations: VaccinationRecord[],
  dewormings: DewormingRecord[],
  vitalSigns: VitalSigns[],
  horseId: string,
): HealthDashboard {
  const now = new Date()
  const horseEvents = events.filter((e) => e.horseId === horseId)

  // Check vaccine status
  const horseVaccinations = vaccinations.filter((v) => v.horseId === horseId)
  const vaccineStatus = getVaccineStatus(horseVaccinations, now)

  // Check deworm status
  const horseDewormings = dewormings.filter((d) => d.horseId === horseId)
  const dewormStatus = getDewormStatus(horseDewormings, now)

  // Get upcoming events (next 30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const upcomingEvents = horseEvents
    .filter((e) => {
      if (!e.plannedDate || e.status === "DONE" || e.status === "CANCELED") return false
      const plannedDate = new Date(e.plannedDate)
      return plannedDate >= now && plannedDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.plannedDate!).getTime() - new Date(b.plannedDate!).getTime())
    .slice(0, 5)

  // Get most recent vitals
  const horseVitals = vitalSigns.filter((v) => v.horseId === horseId).sort((a, b) => b.date.localeCompare(a.date))
  const recentVitals = horseVitals[0] || null

  // Count overdue events
  const overdueCount = horseEvents.filter((e) => {
    if (!e.plannedDate || e.status === "DONE" || e.status === "CANCELED") return false
    return new Date(e.plannedDate) < now
  }).length

  return {
    vaccineStatus,
    dewormStatus,
    upcomingEvents,
    recentVitals,
    pendingRecommendations: 0, // Will be calculated by recommendations engine
    overdueCount,
  }
}

function getVaccineStatus(vaccinations: VaccinationRecord[], now: Date): "OK" | "WARNING" | "OVERDUE" {
  if (vaccinations.length === 0) return "OVERDUE"

  const criticalVaccines = vaccinations.filter((v) => v.vaccineType === "FLU" || v.vaccineType === "TETANUS")

  if (criticalVaccines.length === 0) return "OVERDUE"

  const hasOverdue = criticalVaccines.some((v) => {
    if (!v.nextDueDate) return false
    return new Date(v.nextDueDate) < now
  })

  if (hasOverdue) return "OVERDUE"

  const hasWarning = criticalVaccines.some((v) => {
    if (!v.nextDueDate) return false
    const dueDate = new Date(v.nextDueDate)
    const warningDate = new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days before
    return now >= warningDate && now < dueDate
  })

  if (hasWarning) return "WARNING"

  return "OK"
}

function getDewormStatus(dewormings: DewormingRecord[], now: Date): "OK" | "WARNING" | "OVERDUE" {
  if (dewormings.length === 0) return "OVERDUE"

  const lastDeworming = dewormings.sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!lastDeworming.nextDueDate) return "WARNING"

  const dueDate = new Date(lastDeworming.nextDueDate)

  if (dueDate < now) return "OVERDUE"

  const warningDate = new Date(dueDate.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days before

  if (now >= warningDate) return "WARNING"

  return "OK"
}

export function getEventStatusColor(status: HealthEvent["status"]): string {
  switch (status) {
    case "DONE":
      return "text-green-600 bg-green-50 border-green-200"
    case "PLANNED":
      return "text-blue-600 bg-blue-50 border-blue-200"
    case "OVERDUE":
      return "text-red-600 bg-red-50 border-red-200"
    case "CANCELED":
      return "text-gray-600 bg-gray-50 border-gray-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export function getPriorityColor(priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"): string {
  switch (priority) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-300"
    case "HIGH":
      return "text-orange-600 bg-orange-50 border-orange-300"
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50 border-yellow-300"
    case "LOW":
      return "text-green-600 bg-green-50 border-green-300"
    default:
      return "text-gray-600 bg-gray-50 border-gray-300"
  }
}

export function getCategoryIcon(category: HealthEvent["category"]): string {
  switch (category) {
    case "VACCINE":
      return "💉"
    case "DEWORM":
      return "💊"
    case "FARRIER":
      return "🔨"
    case "DENTAL":
      return "🦷"
    case "VET_VISIT":
      return "🏥"
    case "SURGERY":
      return "⚕️"
    case "MEDICATION":
      return "💊"
    case "CHECKUP":
      return "🩺"
    case "INJURY":
      return "🚑"
    case "HYGIENE":
      return "🧼"
    case "NUTRITION":
      return "🌾"
    default:
      return "📋"
  }
}

export function formatRecurrence(recurrence: HealthEvent["recurrence"]): string {
  switch (recurrence.type) {
    case "NONE":
      return "Pas de récurrence"
    case "WEEKLY":
      return "Chaque semaine"
    case "MONTHLY":
      return "Chaque mois"
    case "BIMONTHLY":
      return "Tous les 2 mois"
    case "QUARTERLY":
      return "Tous les 3 mois"
    case "SEMIANNUAL":
      return "Tous les 6 mois"
    case "ANNUAL":
      return "Chaque année"
    case "CUSTOM":
      return `Tous les ${recurrence.interval} mois`
    default:
      return "Pas de récurrence"
  }
}
