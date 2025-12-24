"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface Horse {
  id: string
  name: string
  breed?: string
  birth_date?: string
  color?: string
  gender?: "male" | "female" | "gelding"
  height?: number
  weight?: number
  microchip_number?: string
  registration_number?: string
  image_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export function useHorses() {
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchHorses = async () => {
    if (!user) {
      setHorses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/horses")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des chevaux")
      }

      setHorses(data.horses || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setHorses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHorses()
  }, [user])

  const addHorse = async (horseData: Partial<Horse>) => {
    try {
      const response = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du cheval")
      }

      await fetchHorses()
      return data.horse
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateHorse = async (id: string, horseData: Partial<Horse>) => {
    try {
      const response = await fetch(`/api/horses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du cheval")
      }

      await fetchHorses()
      return data.horse
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteHorse = async (id: string) => {
    try {
      const response = await fetch(`/api/horses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression du cheval")
      }

      await fetchHorses()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    horses,
    loading,
    error,
    addHorse,
    updateHorse,
    deleteHorse,
    refetch: fetchHorses,
  }
}
