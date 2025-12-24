"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  HeartPulse, 
  Plus, 
  Stethoscope,
  Syringe,
  Bug,
  Scissors,
  AlertCircle,
  ChevronRight,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { HealthEvent } from "@/hooks/use-health-events"

interface HorseHealthTabProps {
  horseId: string
  horseName: string
  events: HealthEvent[]
  loading: boolean
  onAddEvent: () => void
}

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  vet: { icon: Stethoscope, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  vaccine: { icon: Syringe, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  deworming: { icon: Bug, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  farrier: { icon: Scissors, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  dental: { icon: Stethoscope, color: "text-cyan-600", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
  injury: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  illness: { icon: AlertCircle, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  other: { icon: HeartPulse, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
}

const eventTypeLabels: Record<string, string> = {
  vet: "Vétérinaire",
  vaccine: "Vaccination",
  deworming: "Vermifuge",
  farrier: "Maréchal-ferrant",
  dental: "Dentiste",
  injury: "Blessure",
  illness: "Maladie",
  other: "Autre",
}

export function HorseHealthTab({ horseId, horseName, events, loading, onAddEvent }: HorseHealthTabProps) {
  // Trier et grouper les événements
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    const sorted = [...events].sort((a, b) => 
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    )
    
    const upcoming = events
      .filter(e => e.next_due_date && new Date(e.next_due_date) > now)
      .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
      .slice(0, 3)
    
    return {
      upcomingEvents: upcoming,
      pastEvents: sorted.slice(0, 10),
    }
  }, [events])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getDaysUntil = (date: string) => {
    const now = new Date()
    const target = new Date(date)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="p-4 sm:py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Suivi santé</h3>
        <Button size="sm" onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter
        </Button>
      </div>

      {/* Rappels à venir */}
      {upcomingEvents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Rappels à venir
          </h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const config = eventTypeConfig[event.event_type] || eventTypeConfig.other
              const Icon = config.icon
              const daysUntil = getDaysUntil(event.next_due_date!)
              
              return (
                <Card 
                  key={event.id} 
                  className={`p-3 border-l-4 ${
                    daysUntil <= 7 
                      ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20" 
                      : daysUntil <= 30 
                        ? "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                        : "border-l-green-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(event.next_due_date!)}</span>
                        <Badge 
                          variant={daysUntil <= 7 ? "destructive" : daysUntil <= 30 ? "outline" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {daysUntil === 0 
                            ? "Aujourd'hui" 
                            : daysUntil === 1 
                              ? "Demain"
                              : `Dans ${daysUntil}j`
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Historique */}
      {pastEvents.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Historique récent
          </h4>
          <div className="space-y-2">
            {pastEvents.map((event) => {
              const config = eventTypeConfig[event.event_type] || eventTypeConfig.other
              const Icon = config.icon
              
              return (
                <Card key={event.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full ${config.bgColor} shrink-0`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {eventTypeLabels[event.event_type] || event.event_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      {event.veterinarian_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Dr. {event.veterinarian_name}
                        </p>
                      )}
                    </div>
                    {event.cost && (
                      <span className="text-sm font-medium text-foreground">
                        {event.cost}€
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Voir tout */}
          <Link href={`/horses/${horseId}/medical`}>
            <Button variant="ghost" className="w-full mt-3 text-primary">
              Voir tout l'historique
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      ) : (
        /* État vide */
        <Card className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <HeartPulse className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Aucun suivi santé</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Enregistrez les soins de {horseName}
            </p>
            <Button variant="outline" onClick={onAddEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un soin
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
