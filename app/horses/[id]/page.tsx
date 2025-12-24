"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useHealthEvents } from "@/hooks/use-health-events"
import { useToast } from "@/hooks/use-toast"

// Nouveaux composants de la fiche cheval
import { HorseHeader } from "@/components/horses/horse-header"
import { HorseTabs, HorseTabType } from "@/components/horses/horse-tabs"
import { HorseInfoTab } from "@/components/horses/horse-info-tab"
import { HorseAlbumTab } from "@/components/horses/horse-album-tab"
import { HorseNutritionTab } from "@/components/horses/horse-nutrition-tab"
import { HorseHealthTab } from "@/components/horses/horse-health-tab"
import { HorseDocumentsTab } from "@/components/horses/horse-documents-tab"
import { HorseNotesTab } from "@/components/horses/horse-notes-tab"

export interface Horse {
  id: string
  name: string
  breed?: string
  birth_date?: string
  color?: string
  gender?: string
  height?: number
  weight?: number
  microchip_number?: string
  registration_number?: string
  sire_name?: string
  dam_name?: string
  image_url?: string
  notes?: string
}

export default function HorseProfilePage() {
  const params = useParams()
  const router = useRouter()
  const horseId = params.id as string
  const { user } = useAuth()
  
  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<HorseTabType>("info")

  const { toast } = useToast()

  // Hook pour les événements santé (utilisé par l'onglet Santé)
  const { events: healthEvents, loading: eventsLoading, refetch: refetchEvents } = useHealthEvents({ horseId })

  // Calculer l'âge
  const age = useMemo(() => {
    if (!horse?.birth_date) return null
    const birthDate = new Date(horse.birth_date)
    const today = new Date()
    let ageYears = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--
    }
    return ageYears
  }, [horse?.birth_date])

  // Callback pour changement de photo principale
  const handlePhotoChange = useCallback(async (file: File) => {
    if (!horse) throw new Error("Cheval non trouvé")

    const formData = new FormData()
    formData.append("file", file)

    const uploadResponse = await fetch("/api/upload/horse-image", {
      method: "POST",
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.error || "Erreur lors de l'upload")
    }

    const { url } = await uploadResponse.json()

    // Mettre à jour le cheval avec la nouvelle URL
    const updateResponse = await fetch(`/api/horses/${horseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: url }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      throw new Error(errorData.error || "Erreur lors de la mise à jour")
    }

    setHorse({ ...horse, image_url: url })
  }, [horse, horseId])

  // Callback pour suppression de photo
  const handlePhotoDelete = useCallback(async () => {
    if (!horse) throw new Error("Cheval non trouvé")

    // Mettre à jour le cheval pour supprimer l'URL de la photo
    const updateResponse = await fetch(`/api/horses/${horseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: null }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      throw new Error(errorData.error || "Erreur lors de la suppression")
    }

    setHorse({ ...horse, image_url: undefined })
  }, [horse, horseId])

  // Charger les données du cheval
  useEffect(() => {
    const fetchHorse = async () => {
      if (!user || !horseId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/horses/${horseId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Cheval non trouvé")
        }

        setHorse(data.horse)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setHorse(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHorse()
  }, [user, horseId])

  // Callback pour mise à jour du cheval après édition
  const handleHorseUpdate = useCallback(async (data: Partial<Horse>) => {
    if (!horse) return

    const response = await fetch(`/api/horses/${horseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour")
    }

    const result = await response.json()
    setHorse({ ...horse, ...result.horse })
  }, [horse, horseId])

  // Callback pour suppression du cheval
  const handleDelete = useCallback(async () => {
    try {
      const response = await fetch(`/api/horses/${horseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      router.push("/horses")
    } catch (err) {
      console.error("Erreur suppression:", err)
    }
  }, [horseId, router])

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Affichage en cas d'erreur
  if (error || !horse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <p className="text-destructive mb-4">{error || "Cheval non trouvé"}</p>
          <Link href="/horses">
            <Button className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux chevaux
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Rendu de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <HorseInfoTab 
            horse={horse} 
            onUpdate={handleHorseUpdate} 
          />
        )
      case "album":
        return (
          <HorseAlbumTab 
            horseId={horse.id} 
            horseName={horse.name} 
          />
        )
      case "nutrition":
        return (
          <HorseNutritionTab 
            horseId={horse.id} 
            horseName={horse.name} 
          />
        )
      case "health":
        return (
          <HorseHealthTab 
            horseId={horse.id}
            horseName={horse.name}
            events={healthEvents}
            loading={eventsLoading}
            onRefresh={refetchEvents}
          />
        )
      case "documents":
        return (
          <HorseDocumentsTab 
            horseId={horse.id} 
            horseName={horse.name} 
          />
        )
      case "notes":
        return (
          <HorseNotesTab 
            horseId={horse.id} 
            horseName={horse.name} 
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header avec photo hero */}
      <HorseHeader 
        horse={horse}
        age={age}
        onDelete={handleDelete}
        onPhotoChange={handlePhotoChange}
        onPhotoDelete={handlePhotoDelete}
      />

      {/* Onglets de navigation */}
      <HorseTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu de l'onglet actif */}
      <main className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-6">
        {renderTabContent()}
      </main>
    </div>
  )
}
