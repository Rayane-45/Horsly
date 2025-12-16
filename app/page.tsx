"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { HorseCardMini } from "@/components/dashboard/horse-card-mini"
import { EventCardMini } from "@/components/dashboard/event-card-mini"
import { TrainingItemMini } from "@/components/dashboard/training-item-mini"
import { BudgetSummary } from "@/components/dashboard/budget-summary"
import { ActionCards } from "@/components/ai/action-cards"
import { useAIRecommendations } from "@/lib/ai/hooks"
import { Card } from "@/components/ui/card"
import { Clock, TrendingUp, Activity } from "lucide-react"

export default function DashboardPage() {
  const { cards: aiCards, loading: aiLoading, dismissCard } = useAIRecommendations("home")

  const horses = [
    {
      id: 1,
      name: "Luna",
      image: "/beautiful-brown-horse-portrait.jpg",
      breed: "Selle Français",
      age: 8,
      healthStatus: "healthy" as const,
      hasOverdueEvent: false,
    },
    {
      id: 2,
      name: "Thunder",
      image: "/black-horse-portrait.png",
      breed: "Pur-sang",
      age: 6,
      healthStatus: "attention" as const,
      hasOverdueEvent: true,
    },
  ]

  const upcomingEvents = [
    {
      id: "evt-1",
      type: "vet" as const,
      horseName: "Thunder",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      title: "Visite vétérinaire de contrôle",
    },
    {
      id: "evt-2",
      type: "farrier" as const,
      horseName: "Luna",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      title: "Ferrage",
    },
    {
      id: "evt-3",
      type: "vaccine" as const,
      horseName: "Luna",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // in 10 days
      title: "Rappel vaccin grippe",
    },
  ]

  const recentTrainings = [
    {
      id: "train-1",
      horseName: "Luna",
      type: "Dressage",
      duration: 45,
      distance: 3.2,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      intensity: "medium" as const,
    },
    {
      id: "train-2",
      horseName: "Thunder",
      type: "Balade en extérieur",
      duration: 90,
      distance: 12.5,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      intensity: "low" as const,
    },
    {
      id: "train-3",
      horseName: "Luna",
      type: "Saut d'obstacles",
      duration: 60,
      distance: 4.8,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      intensity: "high" as const,
    },
  ]

  const trainingStats = {
    weekSessions: 5,
    weekDuration: 285, // minutes
    weekDistance: 28.4, // km
  }

  const budgetData = {
    totalAmount: 2450,
    previousMonthAmount: 2260,
    categories: [
      { name: "Vétérinaire", amount: 850, color: "#EF4444" },
      { name: "Maréchalerie", amount: 600, color: "#F59E0B" },
      { name: "Alimentation", amount: 450, color: "#10B981" },
      { name: "Pension", amount: 350, color: "#3B82F6" },
      { name: "Équipement", amount: 200, color: "#8B5CF6" },
    ],
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""}`
    }
    return `${mins}min`
  }

  return (
    <AppLayout pageTitle="Accueil" pageSubtitle="Vue d'ensemble : chevaux, santé, entraînements, budget.">
      <div className="space-y-8">
        {(aiCards.length > 0 || aiLoading) && (
          <DashboardSection title="Recommandations IA" isEmpty={false}>
            {aiLoading ? (
              <Card className="p-6 text-center text-muted-foreground">
                <p>Analyse en cours...</p>
              </Card>
            ) : (
              <ActionCards cards={aiCards} onDismiss={dismissCard} />
            )}
          </DashboardSection>
        )}

        {/* Section 1: Mes Chevaux */}
        <DashboardSection
          title="Mes Chevaux"
          action={{ label: "Voir tous", href: "/horses" }}
          isEmpty={horses.length === 0}
          emptyState={{
            message: "Aucun cheval enregistré",
            actionLabel: "Ajouter un cheval",
            actionHref: "/horses/new",
          }}
        >
          {horses.slice(0, 3).map((horse) => (
            <HorseCardMini key={horse.id} {...horse} />
          ))}
        </DashboardSection>

        {/* Section 2: À venir - Rappels & événements santé */}
        <DashboardSection
          title="À venir"
          action={{ label: "Voir le calendrier", href: "/sante" }}
          isEmpty={upcomingEvents.length === 0}
          emptyState={{
            message: "Aucun rappel à venir",
            actionLabel: "Planifier un soin",
            actionHref: "/sante",
          }}
        >
          {upcomingEvents.slice(0, 3).map((event) => (
            <EventCardMini key={event.id} {...event} />
          ))}
        </DashboardSection>

        {/* Section 3: Activité récente - Entraînements */}
        <DashboardSection
          title="Activité récente"
          action={{ label: "Voir mes entraînements", href: "/training" }}
          isEmpty={recentTrainings.length === 0}
          emptyState={{
            message: "Aucun entraînement récemment",
            actionLabel: "Enregistrer une séance",
            actionHref: "/training",
          }}
        >
          {/* Training stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Card className="p-4 bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Séances</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{trainingStats.weekSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </Card>

            <Card className="p-4 bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Durée</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{formatDuration(trainingStats.weekDuration)}</p>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </Card>

            <Card className="p-4 bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Distance</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{trainingStats.weekDistance.toFixed(1)} km</p>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </Card>
          </div>

          {/* Recent training sessions */}
          {recentTrainings.slice(0, 3).map((training) => (
            <TrainingItemMini key={training.id} {...training} />
          ))}
        </DashboardSection>

        {/* Section 4: Budget - Aperçu mensuel */}
        <DashboardSection
          title="Budget"
          isEmpty={budgetData.totalAmount === 0}
          emptyState={{
            message: "Aucune dépense enregistrée",
            actionLabel: "Ajouter une dépense",
            actionHref: "/budget",
          }}
        >
          <BudgetSummary {...budgetData} />
        </DashboardSection>
      </div>
    </AppLayout>
  )
}
