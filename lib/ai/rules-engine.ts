import type { HorseFeatures, WeatherContext, ActionCard } from "./types"
import type { TrainingSession } from "../training/types"
import type { HealthEvent } from "../health/types"

export class RulesEngine {
  // Training Rules

  checkProgressivity(sessions: TrainingSession[], horseId: string): ActionCard[] {
    const cards: ActionCard[] = []
    const last4Weeks = sessions.filter(
      (s) => s.horseId === horseId && new Date(s.date) > new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    )

    // Calculate weekly load (duration * intensity weight)
    const weeklyLoads = this.calculateWeeklyLoads(last4Weeks)

    // Check for >15% increase week-over-week
    for (let i = 1; i < weeklyLoads.length; i++) {
      const increase = (weeklyLoads[i] - weeklyLoads[i - 1]) / weeklyLoads[i - 1]
      if (increase > 0.15) {
        cards.push({
          id: `prog-${Date.now()}`,
          domain: "training",
          severity: "warning",
          title: "Augmentation de charge trop rapide",
          explanation: `La charge d'entraînement a augmenté de ${(increase * 100).toFixed(0)}% cette semaine. Le guide recommande max +10-15% pour éviter les blessures tendineuses.`,
          source: "rules",
          references: ["guide:progressivity:sec2"],
          actions: [
            {
              label: "Alléger cette semaine",
              deeplink: "/training?action=reduce_load",
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    return cards
  }

  checkMuscularRest(sessions: TrainingSession[], horseId: string): ActionCard[] {
    const cards: ActionCard[] = []
    const recent = sessions
      .filter((s) => s.horseId === horseId && s.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (recent.length < 2) return cards

    // Check if high intensity sessions are <48h apart
    for (let i = 0; i < recent.length - 1; i++) {
      if (recent[i].intensity === "high" && recent[i + 1].intensity === "high") {
        const hoursBetween =
          (new Date(recent[i].date).getTime() - new Date(recent[i + 1].date).getTime()) / (1000 * 60 * 60)
        if (hoursBetween < 48) {
          cards.push({
            id: `rest-${Date.now()}`,
            domain: "training",
            severity: "warning",
            title: "Repos musculaire insuffisant",
            explanation: `Deux séances intenses à ${hoursBetween.toFixed(0)}h d'intervalle. Le guide recommande 48-72h de récupération après haute intensité pour éviter les micro-déchirures.`,
            source: "rules",
            references: ["guide:recovery:sec2-2"],
            actions: [
              {
                label: "Planifier repos",
                deeplink: "/training?action=add_rest_day",
              },
            ],
            createdAt: new Date(),
          })
        }
      }
    }

    return cards
  }

  checkWeatherAdaptation(weather: WeatherContext, plannedSession?: TrainingSession): ActionCard[] {
    const cards: ActionCard[] = []

    // Heat alert (HI > 30)
    if (weather.heatIndex > 30) {
      cards.push({
        id: `heat-${Date.now()}`,
        domain: "training",
        severity: "warning",
        title: "Chaleur forte aujourd'hui : adapte la séance",
        explanation: `Indice de chaleur ${weather.heatIndex}°C. Privilégie tôt/soir, fractionne avec pauses 10min, eau + électrolytes. Récup 15min au pas + douche.`,
        source: "rules",
        references: ["guide:thermoreg:secVI", "guide:summer:secV-2"],
        actions: [
          {
            label: "Plan séance cool",
            deeplink: "/training/new?template=cool",
          },
        ],
        createdAt: new Date(),
      })
    }

    // Cold alert (< 5°C)
    if (weather.tempC < 5) {
      cards.push({
        id: `cold-${Date.now()}`,
        domain: "training",
        severity: "advice",
        title: "Temps froid : échauffement prolongé",
        explanation: `${weather.tempC}°C. Doubler la détente (20-30min), utiliser couvre-reins, marcher 15min après pour sécher. Éviter galops sur sol gelé.`,
        source: "rules",
        references: ["guide:winter:secVI-1"],
        actions: [
          {
            label: "Voir conseils hiver",
            deeplink: "/training?tips=winter",
          },
        ],
        createdAt: new Date(),
      })
    }

    // Hard ground warning
    if (weather.ground === "hard" || weather.ground === "frozen") {
      cards.push({
        id: `ground-${Date.now()}`,
        domain: "training",
        severity: "warning",
        title: "Sol dur : risque articulaire",
        explanation:
          "Sol dur/gelé = chocs violents sur articulations. Éviter galops rapides, privilégier plat/assouplissements, ou travailler sur sol souple.",
        source: "rules",
        references: ["guide:surfaces:secVII-1"],
        actions: [
          {
            label: "Adapter séance",
            deeplink: "/training?action=adapt_surface",
          },
        ],
        createdAt: new Date(),
      })
    }

    return cards
  }

  checkAgeAppropriate(horse: HorseFeatures, session: TrainingSession): ActionCard[] {
    const cards: ActionCard[] = []

    // Young horse (<5 years)
    if (horse.age < 5) {
      if (session.durationMin > 40) {
        cards.push({
          id: `age-young-${Date.now()}`,
          domain: "training",
          severity: "warning",
          title: "Séance trop longue pour jeune cheval",
          explanation: `Cheval de ${horse.age} ans : max 30-40min. Squelette immature, risque blessures. Privilégier variété et courtes séances.`,
          source: "rules",
          references: ["guide:young:secIV-1"],
          actions: [
            {
              label: "Réduire durée",
              deeplink: `/training/${session.id}/edit?duration=30`,
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    // Senior horse (>18 years)
    if (horse.age > 18) {
      if (session.intensity === "high") {
        cards.push({
          id: `age-senior-${Date.now()}`,
          domain: "training",
          severity: "advice",
          title: "Intensité élevée pour senior",
          explanation: `Cheval ${horse.age} ans : privilégier séances courtes (20-30min), échauffement prolongé, intensité modérée. Arthrose possible.`,
          source: "rules",
          references: ["guide:senior:secIV-3"],
          actions: [
            {
              label: "Adapter intensité",
              deeplink: `/training/${session.id}/edit?intensity=mod`,
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    return cards
  }

  // Health Rules

  checkHealthWindows(events: HealthEvent[], horseId: string): ActionCard[] {
    const cards: ActionCard[] = []
    const now = new Date()

    // Deworming: every 3-6 months
    const lastDeworming = events
      .filter((e) => e.horseId === horseId && e.type === "deworming")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (lastDeworming) {
      const monthsSince = (now.getTime() - new Date(lastDeworming.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (monthsSince > 6) {
        cards.push({
          id: `deworm-${Date.now()}`,
          domain: "health",
          severity: "advice",
          title: "Vermifuge en retard",
          explanation: `Dernier vermifuge il y a ${monthsSince.toFixed(1)} mois. Fenêtre optimale 3-6 mois selon profil. Planifier cette semaine.`,
          source: "rules",
          references: ["guide:health:windows"],
          actions: [
            {
              label: "Planifier",
              deeplink: `/sante/new?type=deworming&horse=${horseId}`,
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    // Farrier: every 5-8 weeks
    const lastFarrier = events
      .filter((e) => e.horseId === horseId && e.type === "farrier")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (lastFarrier) {
      const weeksSince = (now.getTime() - new Date(lastFarrier.date).getTime()) / (1000 * 60 * 60 * 24 * 7)
      if (weeksSince > 8) {
        cards.push({
          id: `farrier-${Date.now()}`,
          domain: "health",
          severity: "warning",
          title: "Maréchal en retard",
          explanation: `Dernier passage il y a ${weeksSince.toFixed(0)} semaines. Max 6-8 semaines recommandé pour éviter déséquilibres et risques tendineux.`,
          source: "rules",
          references: ["guide:farrier:secVII-2"],
          actions: [
            {
              label: "Prendre RDV",
              deeplink: `/sante/new?type=farrier&horse=${horseId}`,
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    return cards
  }

  checkPostEffortCare(session: TrainingSession, weather: WeatherContext): ActionCard[] {
    const cards: ActionCard[] = []

    // Hot & humid + heavy sweat
    if (weather.heatIndex > 28 && weather.humidity > 70 && session.intensity === "high") {
      cards.push({
        id: `posteff-${Date.now()}`,
        domain: "health",
        severity: "advice",
        title: "Refroidissement actif nécessaire",
        explanation:
          "Chaleur + humidité + effort intense. Refroidir 15min au pas, douche eau fraîche, électrolytes, surveiller déshydratation.",
        source: "rules",
        references: ["guide:recovery:secV-2"],
        actions: [
          {
            label: "Protocole récup",
            deeplink: "/sante?tips=post_effort",
          },
        ],
        createdAt: new Date(),
      })
    }

    return cards
  }

  // Budget Rules

  detectRecurringExpenses(expenses: any[]): ActionCard[] {
    const cards: ActionCard[] = []

    const validExpenses = expenses.filter((e) => e.description && typeof e.description === "string")

    // Group by description similarity
    const grouped = this.groupSimilarExpenses(validExpenses)

    for (const [key, group] of Object.entries(grouped)) {
      if (group.length >= 3) {
        // Check if monthly pattern
        const isMonthly = this.isMonthlyPattern(group)
        if (isMonthly && !group[0].recurrence) {
          cards.push({
            id: `recur-${Date.now()}`,
            domain: "budget",
            severity: "info",
            title: "Récurrence pension non configurée",
            explanation: `${group.length} dépenses similaires détectées (${key}). Créer RRULE mensuelle pour automatiser.`,
            source: "rules",
            actions: [
              {
                label: "Créer récurrence",
                deeplink: `/budget/recurrence/new?prefill=${encodeURIComponent(JSON.stringify(group[0]))}`,
              },
            ],
            createdAt: new Date(),
          })
        }
      }
    }

    return cards
  }

  detectAnomalies(expenses: any[], category: string): ActionCard[] {
    const cards: ActionCard[] = []

    const categoryExpenses = expenses.filter((e) => e.category === category)
    if (categoryExpenses.length < 5) return cards

    // Calculate p95
    const amounts = categoryExpenses.map((e) => e.amount).sort((a, b) => a - b)
    const p95 = amounts[Math.floor(amounts.length * 0.95)]

    // Check recent expenses
    const recent = categoryExpenses.slice(-3)
    for (const exp of recent) {
      if (exp.amount > p95) {
        cards.push({
          id: `anom-${Date.now()}`,
          domain: "budget",
          severity: "warning",
          title: `Dépense anormale : ${category}`,
          explanation: `${exp.amount}€ dépasse le 95e percentile (${p95.toFixed(0)}€). Vérifier double comptage ou erreur.`,
          source: "rules",
          actions: [
            {
              label: "Vérifier",
              deeplink: `/budget/operations/${exp.id}`,
            },
          ],
          createdAt: new Date(),
        })
      }
    }

    return cards
  }

  // Helper methods

  private calculateWeeklyLoads(sessions: TrainingSession[]): number[] {
    const weeks: { [key: string]: number } = {}

    for (const session of sessions) {
      const weekKey = this.getWeekKey(new Date(session.date))
      const load = session.durationMin * this.getIntensityWeight(session.intensity)
      weeks[weekKey] = (weeks[weekKey] || 0) + load
    }

    return Object.values(weeks)
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    return `${year}-W${week}`
  }

  private getIntensityWeight(intensity: string): number {
    switch (intensity) {
      case "low":
        return 0.5
      case "mod":
        return 1.0
      case "high":
        return 1.5
      default:
        return 1.0
    }
  }

  private groupSimilarExpenses(expenses: any[]): { [key: string]: any[] } {
    const groups: { [key: string]: any[] } = {}

    for (const exp of expenses) {
      if (!exp.description || typeof exp.description !== "string") continue

      const key = exp.description.toLowerCase().slice(0, 20)
      if (!groups[key]) groups[key] = []
      groups[key].push(exp)
    }

    return groups
  }

  private isMonthlyPattern(expenses: any[]): boolean {
    if (expenses.length < 3) return false

    const dates = expenses.map((e) => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime())
    const intervals = []

    for (let i = 1; i < dates.length; i++) {
      const days = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(days)
    }

    // Check if intervals are ~28-32 days (monthly)
    return intervals.every((d) => d >= 25 && d <= 35)
  }
}

export const rulesEngine = new RulesEngine()
