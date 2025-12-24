"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Activity, MapPin, Zap, Play, Loader2, Calendar } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTrainingSessions, TrainingSession } from "@/hooks/use-training-sessions"
import { useHorses } from "@/hooks/use-horses"
import { AddTrainingDialog } from "@/components/add-training-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 min"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} min`
}

export default function TrainingPage() {
  const router = useRouter()
  const { sessions, loading, error, deleteSession, refetch } = useTrainingSessions()
  const { horses } = useHorses()

  // Calculate stats from real sessions
  const stats = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekSessions = sessions.filter((s) => new Date(s.start_time) >= weekAgo)

    const totalDuration = thisWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalDistance = thisWeekSessions.reduce((sum, s) => sum + (s.distance || 0), 0)

    // Weekly load calculation
    const previousWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const previousWeekSessions = sessions.filter((s) => {
      const date = new Date(s.start_time)
      return date >= previousWeekStart && date < weekAgo
    })
    const previousWeekLoad = previousWeekSessions.length
    const currentWeekLoad = thisWeekSessions.length
    const loadChange = previousWeekLoad > 0 ? ((currentWeekLoad - previousWeekLoad) / previousWeekLoad) * 100 : 0

    return {
      totalDuration,
      totalDistance,
      sessionCount: thisWeekSessions.length,
      currentWeekLoad,
      loadChange,
      overload: loadChange > 30,
    }
  }, [sessions])

  const handleDeleteSession = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      try {
        await deleteSession(id)
      } catch (err) {
        console.error("Erreur lors de la suppression:", err)
      }
    }
  }

  const getSessionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      plat: "Plat",
      obstacle: "Obstacle",
      dressage: "Dressage",
      endurance: "Endurance",
      longe: "Longe",
      balade: "Balade",
      cross: "Cross",
      autre: "Autre",
    }
    return types[type] || type
  }

  const getIntensityBadge = (intensity?: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    const labels: Record<string, string> = {
      low: "Léger",
      medium: "Modéré",
      high: "Intense",
    }
    if (!intensity) return null
    return <Badge className={colors[intensity] || ""}>{labels[intensity] || intensity}</Badge>
  }

  return (
    <AppLayout pageTitle="Entraînements" pageSubtitle="Suivi des séances et recommandations du coach IA">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Temps total</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-2xl font-semibold text-foreground">{formatDuration(stats.totalDuration)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.sessionCount} séance{stats.sessionCount > 1 ? 's' : ''}</p>
              </>
            )}
          </Card>

          <Card className="p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Distance</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-2xl font-semibold text-foreground">{(stats.totalDistance / 1000).toFixed(1)} km</p>
                <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
              </>
            )}
          </Card>

          <Card className="p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Total séances</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Toutes périodes</p>
              </>
            )}
          </Card>

          <Card className="p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Charge</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-2xl font-semibold text-foreground">{stats.currentWeekLoad}</p>
                <p className={`text-xs mt-1 ${stats.overload ? "text-destructive" : "text-secondary"}`}>
                  {stats.loadChange > 0 ? "+" : ""}
                  {stats.loadChange.toFixed(0)}% vs semaine dernière
                </p>
              </>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button size="default" onClick={() => router.push("/training/live")} className="w-full text-xs sm:text-sm h-10 sm:h-11">
            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Séance live</span>
          </Button>
          <AddTrainingDialog onSuccess={refetch} />
        </div>

        {/* Sessions List */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50">
            <TabsTrigger value="timeline">Historique</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Chargement des séances...</span>
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucune séance enregistrée</p>
                <p className="text-sm mt-1">Commencez par ajouter votre première séance d'entraînement</p>
                <div className="mt-4">
                  <AddTrainingDialog onSuccess={refetch} />
                </div>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {sessions
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .map((session) => (
                    <Card key={session.id} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                            <h3 className="font-medium text-sm sm:text-base truncate">{session.title}</h3>
                            <Badge variant="outline" className="text-xs">{getSessionTypeLabel(session.session_type)}</Badge>
                            {getIntensityBadge(session.intensity)}
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {new Date(session.start_time).toLocaleDateString("fr-FR", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                            {session.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                {formatDuration(session.duration)}
                              </div>
                            )}
                            {session.distance && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                {(session.distance / 1000).toFixed(1)} km
                              </div>
                            )}
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{session.horses?.name || "Cheval inconnu"}</span>
                          </div>
                          {session.notes && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-end sm:justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-destructive hover:text-destructive text-xs h-7 px-2"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Calendrier des séances</h3>
              {sessions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Aucune séance à afficher sur le calendrier
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Simple calendar view - group by date */}
                  {Object.entries(
                    sessions.reduce((acc, session) => {
                      const date = new Date(session.start_time).toLocaleDateString("fr-FR")
                      if (!acc[date]) acc[date] = []
                      acc[date].push(session)
                      return acc
                    }, {} as Record<string, TrainingSession[]>)
                  )
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .slice(0, 10)
                    .map(([date, daySessions]) => (
                      <div key={date} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-2 rounded hover:bg-muted/50">
                        <div className="font-medium text-xs sm:text-sm sm:w-28">{date}</div>
                        <div className="flex-1 flex flex-wrap gap-1 sm:gap-2">
                          {daySessions.map((s) => (
                            <Badge key={s.id} variant="outline" className="text-xs truncate max-w-[150px] sm:max-w-none">
                              {s.title} - {s.horses?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
