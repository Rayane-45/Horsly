"use client"

import { useState, useEffect } from "react"
import type { ActionCard } from "./types"

export function useAIRecommendations(page: "home" | "training" | "sante" | "budget", horseId?: string) {
  const [cards, setCards] = useState<ActionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        const response = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user-1", // In real app, get from auth
            horseId,
            page,
            horizonDays: 7,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setCards(data.cards || [])
      } catch (err) {
        console.error("[v0] Failed to fetch AI recommendations:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [page, horseId])

  const dismissCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    // In real app, persist dismissal to backend
  }

  return { cards, loading, error, dismissCard }
}
