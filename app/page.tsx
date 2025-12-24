"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { HorseCardMini } from "@/components/dashboard/horse-card-mini"
import { EventCardMini } from "@/components/dashboard/event-card-mini"
import { TrainingItemMini } from "@/components/dashboard/training-item-mini"
import { BudgetSummary } from "@/components/dashboard/budget-summary"
import { ActionCards } from "@/components/ai/action-cards"
import { WeeklyWeatherCard } from "@/components/weather/WeeklyWeatherCard"
import { useAIRecommendations } from "@/lib/ai/hooks"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, Activity, Loader2, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useHorses } from "@/hooks/use-horses"
import { useHealthEvents } from "@/hooks/use-health-events"
import { useTrainingSessions } from "@/hooks/use-training-sessions"
import { useExpensesContext } from "@/contexts/expenses-context"
import { useBudgetSummary } from "@/hooks/use-expenses"
import { useState, useEffect } from "react"
import { LoginDialog } from "@/components/auth/login-dialog"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { cards: aiCards, loading: aiLoading, dismissCard } = useAIRecommendations("home")
  const { horses, loading: horsesLoading } = useHorses()
  const { events: healthEvents, loading: eventsLoading } = useHealthEvents()
  const { sessions: trainingSessions, loading: sessionsLoading } = useTrainingSessions()
  const { expenses, loading: expensesLoading } = useExpensesContext()
  const { summary: budgetSummary } = useBudgetSummary()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Transformer les chevaux en format compatible
  const horsesData = horses.map(horse => ({
    id: horse.id,
    name: horse.name,
    image: horse.image_url || "/placeholder.svg",
    breed: horse.breed || "Race non renseignée",
    age: horse.birth_date ? Math.floor((Date.now() - new Date(horse.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
    healthStatus: "healthy" as const,
    hasOverdueEvent: false,
  }))

  // Événements à venir (prochains 30 jours)
  const upcomingEvents = healthEvents
    .filter(e => new Date(e.next_due_date || e.event_date) > new Date())
    .sort((a, b) => new Date(a.next_due_date || a.event_date).getTime() - new Date(b.next_due_date || b.event_date).getTime())
    .slice(0, 3)
    .map(event => ({
      id: event.id,
      type: event.event_type as "vet" | "farrier" | "vaccine" | "deworming" | "dental" | "other",
      horseName: event.horses?.name || "Cheval",
      date: new Date(event.next_due_date || event.event_date),
      title: event.title,
    }))

  // Entraînements récents
  const recentTrainings = trainingSessions
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 3)
    .map(session => ({
      id: session.id,
      horseName: session.horses?.name || "Cheval",
      type: session.session_type || "Entraînement",
      duration: session.duration || 0,
      distance: session.distance || 0,
      date: new Date(session.start_time),
      intensity: (session.intensity || "medium") as "low" | "medium" | "high",
    }))

  // Stats de la semaine
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const weekSessions = trainingSessions.filter(s => new Date(s.start_time) >= weekAgo)
  const trainingStats = {
    weekSessions: weekSessions.length,
    weekDuration: weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    weekDistance: weekSessions.reduce((acc, s) => acc + (s.distance || 0), 0),
  }

  // Données budget
  const currentMonth = new Date()
  const monthExpenses = expenses.filter(e => {
    const expDate = new Date(e.expense_date)
    return expDate.getMonth() === currentMonth.getMonth() && 
           expDate.getFullYear() === currentMonth.getFullYear()
  })
  
  const totalAmount = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0)
  
  // Grouper par catégorie
  const categoryMap: Record<string, { name: string; amount: number; color: string }> = {}
  const categoryColors: Record<string, string> = {
    vet: "#EF4444",
    farrier: "#F59E0B", 
    feed: "#10B981",
    boarding: "#3B82F6",
    equipment: "#8B5CF6",
    training: "#EC4899",
    competition: "#06B6D4",
    transport: "#84CC16",
    insurance: "#6366F1",
    other: "#9CA3AF",
  }
  const categoryLabels: Record<string, string> = {
    vet: "Vétérinaire",
    farrier: "Maréchalerie",
    feed: "Alimentation",
    boarding: "Pension",
    equipment: "Équipement",
    training: "Entraînement",
    competition: "Compétition",
    transport: "Transport",
    insurance: "Assurance",
    other: "Autre",
  }

  monthExpenses.forEach(e => {
    const cat = e.category || "other"
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        name: categoryLabels[cat] || cat,
        amount: 0,
        color: categoryColors[cat] || "#9CA3AF",
      }
    }
    categoryMap[cat].amount += e.amount || 0
  })

  const budgetData = {
    totalAmount,
    previousMonthAmount: budgetSummary?.spent || 0,
    categories: Object.values(categoryMap).filter(c => c.amount > 0),
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""}`
    }
    return `${mins}min`
  }

  // État de chargement initial ou non monté
  if (!mounted || authLoading) {
    return (
      <AppLayout pageTitle="Accueil" pageSubtitle="Vue d'ensemble : chevaux, santé, entraînements, budget.">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  // Si non connecté
  if (!user) {
    return (
      <AppLayout pageTitle="Accueil" pageSubtitle="Vue d'ensemble : chevaux, santé, entraînements, budget.">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Bienvenue sur Cavaly</h3>
              <p className="text-muted-foreground mt-1">
                Connectez-vous pour gérer vos chevaux, suivre leur santé et leurs entraînements
              </p>
            </div>
            <Button onClick={() => setShowLoginDialog(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          </div>
        </Card>
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Accueil" pageSubtitle="Vue d'ensemble : chevaux, santé, entraînements, budget.">
      <div className="space-y-6 sm:space-y-8">
        {/* Section Météo - 7 jours */}
        <WeeklyWeatherCard />

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
          isEmpty={!horsesLoading && horsesData.length === 0}
          emptyState={{
            message: "Aucun cheval enregistré",
            actionLabel: "Ajouter un cheval",
            actionHref: "/horses",
          }}
        >
          {horsesLoading ? (
            <Card className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </Card>
          ) : (
            horsesData.slice(0, 3).map((horse) => (
              <HorseCardMini key={horse.id} {...horse} />
            ))
          )}
        </DashboardSection>

        {/* Section 2: À venir - Rappels & événements santé */}
        <DashboardSection
          title="À venir"
          action={{ label: "Voir le calendrier", href: "/sante" }}
          isEmpty={!eventsLoading && upcomingEvents.length === 0}
          emptyState={{
            message: "Aucun rappel à venir",
            actionLabel: "Planifier un soin",
            actionHref: "/sante",
          }}
        >
          {eventsLoading ? (
            <Card className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <EventCardMini key={event.id} {...event} />
            ))
          )}
        </DashboardSection>

        {/* Section 3: Activité récente - Entraînements */}
        <DashboardSection
          title="Activité récente"
          action={{ label: "Voir mes entraînements", href: "/training" }}
          isEmpty={!sessionsLoading && recentTrainings.length === 0}
          emptyState={{
            message: "Aucun entraînement récemment",
            actionLabel: "Enregistrer une séance",
            actionHref: "/training",
          }}
        >
          {/* Training stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
            <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Séances</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">{trainingStats.weekSessions}</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">Cette sem.</p>
            </Card>

            <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Durée</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">{formatDuration(trainingStats.weekDuration)}</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">Cette sem.</p>
            </Card>

            <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Distance</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">{trainingStats.weekDistance.toFixed(1)} km</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">Cette sem.</p>
            </Card>
          </div>

          {/* Recent training sessions */}
          {sessionsLoading ? (
            <Card className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </Card>
          ) : (
            recentTrainings.map((training) => (
              <TrainingItemMini key={training.id} {...training} />
            ))
          )}
        </DashboardSection>

        {/* Section 4: Budget - Aperçu mensuel */}
        <DashboardSection
          title="Budget"
          isEmpty={!expensesLoading && budgetData.totalAmount === 0}
          emptyState={{
            message: "Aucune dépense enregistrée",
            actionLabel: "Ajouter une dépense",
            actionHref: "/budget",
          }}
        >
          {expensesLoading ? (
            <Card className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </Card>
          ) : (
            <BudgetSummary {...budgetData} />
          )}
        </DashboardSection>
      </div>
    </AppLayout>
  )
}
