"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface HealthEvent {
  id: string
  horse_id: string
  event_type: "vet" | "farrier" | "vaccine" | "deworming" | "dental" | "injury" | "illness" | "other"
  title: string
  description?: string
  event_date: string
  next_due_date?: string
  veterinarian_name?: string
  cost?: number
  attachments?: string[]
  notes?: string
  horses?: { name: string; id: string }
  created_at: string
  updated_at: string
}

export function useHealthEvents(filters?: {
  horseId?: string
  eventType?: string
}) {
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchEvents = async () => {
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.horseId) params.append("horseId", filters.horseId)
      if (filters?.eventType) params.append("eventType", filters.eventType)

      const response = await fetch(`/api/health/events?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des événements")
      }

      setEvents(data.events || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [user, filters?.horseId, filters?.eventType])

  const addEvent = async (eventData: Partial<HealthEvent>) => {
    try {
      const response = await fetch("/api/health/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'événement")
      }

      await fetchEvents()
      return data.event
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateEvent = async (id: string, eventData: Partial<HealthEvent>) => {
    try {
      const response = await fetch(`/api/health/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de l'événement")
      }

      await fetchEvents()
      return data.event
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/health/events/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression de l'événement")
      }

      await fetchEvents()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  }
}
