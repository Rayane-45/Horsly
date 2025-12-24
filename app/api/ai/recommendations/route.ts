import { type NextRequest, NextResponse } from "next/server"
import { rulesEngine } from "@/lib/ai/rules-engine"
import { mockSessions } from "@/lib/training/mock-data"
import { mockHealthEvents } from "@/lib/health/mock-data"
import { mockOperations } from "@/lib/budget/mock-data"
import type { ActionCard } from "@/lib/ai/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, horseId, page, horizonDays = 7 } = body

    const cards: ActionCard[] = []

    // Use mock data directly on the server (in real app, fetch from DB)
    const trainingSessions = mockSessions
    const healthEvents = mockHealthEvents
    const budgetOps = mockOperations

    // Mock weather (in real app, fetch from API)
    const weather = {
      date: new Date(),
      tempC: 18,
      humidity: 65,
      heatIndex: 20,
      ground: "good" as const,
    }

    // Run rules engine based on page context
    if (page === "home" || page === "training") {
      // Training rules
      if (horseId) {
        cards.push(...rulesEngine.checkProgressivity(trainingSessions, horseId))
        cards.push(...rulesEngine.checkMuscularRest(trainingSessions, horseId))
      }
      cards.push(...rulesEngine.checkWeatherAdaptation(weather))
    }

    if (page === "home" || page === "sante") {
      // Health rules
      if (horseId) {
        cards.push(...rulesEngine.checkHealthWindows(healthEvents, horseId))
      }
    }

    if (page === "home" || page === "budget") {
      // Budget rules
      cards.push(...rulesEngine.detectRecurringExpenses(budgetOps))

      const categories = [...new Set(budgetOps.map((o) => o.category))]
      for (const cat of categories) {
        cards.push(...rulesEngine.detectAnomalies(budgetOps, cat))
      }
    }

    // Sort by severity and freshness
    const sorted = cards.sort((a, b) => {
      const severityOrder = { critical: 4, warning: 3, advice: 2, info: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    // Limit to top 5 for home, all for specific pages
    const limited = page === "home" ? sorted.slice(0, 5) : sorted

    return NextResponse.json({ cards: limited })
  } catch (error) {
    console.error("[v0] AI recommendations error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
