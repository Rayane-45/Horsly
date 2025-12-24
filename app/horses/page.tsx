"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useHorses, Horse } from "@/hooks/use-horses"
import { useAuth } from "@/components/auth/auth-provider"
import { AddHorseDialog } from "@/components/add-horse-dialog"
import { LoginDialog } from "@/components/auth/login-dialog"

function calculateAge(birthDate: string | undefined): string {
  if (!birthDate) return ""
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} an${age > 1 ? "s" : ""}`
}

function getGenderLabel(gender: string | undefined): string {
  switch (gender) {
    case "male": return "Étalon"
    case "female": return "Jument"
    case "gelding": return "Hongre"
    default: return ""
  }
}

export default function HorsesPage() {
  const { user, loading: authLoading } = useAuth()
  const { horses, loading, error, refetch } = useHorses()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleAddClick = () => {
    if (!user) {
      setShowLoginDialog(true)
    } else {
      setShowAddDialog(true)
    }
  }

  const handleAddSuccess = () => {
    refetch()
  }

  // État de chargement
  if (authLoading) {
    return (
      <AppLayout pageTitle="Mes Chevaux" pageSubtitle="Gérez vos chevaux et suivez leur santé, entraînements et budget.">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Mes Chevaux" pageSubtitle="Gérez vos chevaux et suivez leur santé, entraînements et budget.">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {horses.length} {horses.length > 1 ? "chevaux" : "cheval"}
              </p>
            )}
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un cheval
          </Button>
        </div>

        {/* Message si non connecté */}
        {!user && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour voir et gérer vos chevaux
            </p>
            <Button onClick={() => setShowLoginDialog(true)}>
              Se connecter
            </Button>
          </Card>
        )}

        {/* Erreur */}
        {error && user && (
          <Card className="p-6 text-center border-destructive">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </Card>
        )}

        {/* État vide (connecté mais pas de chevaux) */}
        {user && !loading && !error && horses.length === 0 && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Aucun cheval</h3>
                <p className="text-muted-foreground mt-1">
                  Commencez par ajouter votre premier cheval
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter mon premier cheval
              </Button>
            </div>
          </Card>
        )}

        {/* Chargement */}
        {loading && user && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Horses Grid */}
        {user && !loading && horses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horses.map((horse: Horse) => (
              <Link key={horse.id} href={`/horses/${horse.id}`}>
                <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors h-full">
                  <div className="flex flex-col gap-4">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-muted">
                      <Image 
                        src={horse.image_url || "/placeholder.svg"} 
                        alt={horse.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-xl">{horse.name}</h3>
                          <p className="text-sm text-muted-foreground">{horse.breed || "Race non renseignée"}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-secondary/10 text-secondary border-secondary/20"
                        >
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          OK
                        </Badge>
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                        {horse.birth_date && <span>{calculateAge(horse.birth_date)}</span>}
                        {horse.height && <span>{horse.height} cm</span>}
                        {horse.weight && <span>{horse.weight} kg</span>}
                        {horse.gender && <span>{getGenderLabel(horse.gender)}</span>}
                      </div>

                      {horse.color && (
                        <p className="text-sm text-muted-foreground">
                          Robe : {horse.color}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddHorseDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </AppLayout>
  )
}
