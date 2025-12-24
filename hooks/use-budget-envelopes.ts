"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface BudgetEnvelope {
  id: string
  user_id: string
  category: string
  monthly_budget: number
  created_at: string
  updated_at: string
}

export function useBudgetEnvelopes() {
  const { user } = useAuth()
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnvelopes = useCallback(async () => {
    if (!user) {
      setEnvelopes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/budget/envelopes")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des enveloppes")
      }

      setEnvelopes(data.envelopes || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setEnvelopes([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEnvelopes()
  }, [fetchEnvelopes])

  const addEnvelope = async (envelope: Omit<BudgetEnvelope, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("Non authentifié")

    const response = await fetch("/api/budget/envelopes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'ajout de l'enveloppe")
    }

    await fetchEnvelopes()
    return data.envelope
  }

  const updateEnvelope = async (id: string, updates: Partial<Omit<BudgetEnvelope, "id" | "user_id" | "created_at" | "updated_at">>) => {
    if (!user) throw new Error("Non authentifié")

    const response = await fetch(`/api/budget/envelopes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la mise à jour de l'enveloppe")
    }

    await fetchEnvelopes()
    return data.envelope
  }

  const deleteEnvelope = async (id: string) => {
    if (!user) throw new Error("Non authentifié")

    const response = await fetch(`/api/budget/envelopes/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Erreur lors de la suppression de l'enveloppe")
    }

    await fetchEnvelopes()
  }

  return {
    envelopes,
    loading,
    error,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    refetch: fetchEnvelopes,
  }
}
