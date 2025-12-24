"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface TrainingSession {
  id: string
  horse_id: string
  session_type: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  duration?: number
  distance?: number
  intensity?: "low" | "medium" | "high"
  location?: string
  gps_track?: Array<{
    lat: number
    lng: number
    timestamp: string
    speed?: number
    altitude?: number
  }>
  average_speed?: number
  max_speed?: number
  elevation_gain?: number
  weather?: string
  notes?: string
  horses?: { name: string; id: string }
  created_at: string
  updated_at: string
}

export function useTrainingSessions(filters?: {
  horseId?: string
  startDate?: string
  endDate?: string
}) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSessions = async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.horseId) params.append("horseId", filters.horseId)
      if (filters?.startDate) params.append("startDate", filters.startDate)
      if (filters?.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/training/sessions?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des séances")
      }

      setSessions(data.sessions || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [user, filters?.horseId, filters?.startDate, filters?.endDate])

  const addSession = async (sessionData: Partial<TrainingSession>) => {
    try {
      const response = await fetch("/api/training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la séance")
      }

      await fetchSessions()
      return data.session
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateSession = async (id: string, sessionData: Partial<TrainingSession>) => {
    try {
      const response = await fetch(`/api/training/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de la séance")
      }

      await fetchSessions()
      return data.session
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteSession = async (id: string) => {
    try {
      const response = await fetch(`/api/training/sessions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression de la séance")
      }

      await fetchSessions()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  }
}
