"use client"

import { useTrainingStore } from "@/lib/training/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDuration, formatDistance, formatSpeed } from "@/lib/training/calculations"
import { Play, Square, MapPin, Clock, TrendingUp, Heart, Trash2 } from "lucide-react"

const typeLabels: Record<string, string> = {
  DRESSAGE: "Dressage",
  EXTERIOR: "Extérieur",
  ENDURANCE: "Endurance",
  CSO: "CSO",
  LEISURE: "Balade",
  WESTERN: "Western",
  DRIVING: "Attelage",
  LONGE: "Longe",
  RECOVERY: "Récupération",
}

const intensityColors: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-700 border-green-500/20",
  MODERATE: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  HARD: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  MAX: "bg-red-500/10 text-red-700 border-red-500/20",
}

const statusColors: Record<string, string> = {
  PLANNED: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  ACTIVE: "bg-primary/10 text-primary border-primary/20",
  DONE: "bg-secondary/10 text-secondary border-secondary/20",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/20",
}

export function SessionTimeline() {
  const sessions = useTrainingStore((state) => state.sessions)
  const startSession = useTrainingStore((state) => state.startSession)
  const stopSession = useTrainingStore((state) => state.stopSession)
  const deleteSession = useTrainingStore((state) => state.deleteSession)

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.start || a.plannedStart || a.createdAt)
    const dateB = new Date(b.start || b.plannedStart || b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="space-y-3">
      {sortedSessions.map((session) => (
        <Card key={session.id} className="p-4 bg-card border border-border">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-lg mb-1">{session.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={statusColors[session.status]}>
                    {session.status === "PLANNED" && "Planifié"}
                    {session.status === "ACTIVE" && "En cours"}
                    {session.status === "DONE" && "Terminé"}
                    {session.status === "CANCELED" && "Annulé"}
                  </Badge>
                  <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                    {typeLabels[session.type]}
                  </Badge>
                  <Badge variant="outline" className={intensityColors[session.intensity]}>
                    {session.intensity === "EASY" && "Facile"}
                    {session.intensity === "MODERATE" && "Modéré"}
                    {session.intensity === "HARD" && "Intense"}
                    {session.intensity === "MAX" && "Maximum"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {session.status === "PLANNED" && (
                  <Button size="sm" variant="outline" onClick={() => startSession(session.id)} className="gap-2">
                    <Play className="h-4 w-4" />
                    Démarrer
                  </Button>
                )}
                {session.status === "ACTIVE" && (
                  <Button size="sm" variant="outline" onClick={() => stopSession(session.id)} className="gap-2">
                    <Square className="h-4 w-4" />
                    Terminer
                  </Button>
                )}
                {session.status === "PLANNED" && (
                  <Button size="sm" variant="ghost" onClick={() => deleteSession(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {session.status === "DONE" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDuration(session.durationSec)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDistance(session.distanceM)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatSpeed(session.avgSpeedKmh)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{session.hrAvgBpm} bpm</span>
                </div>
              </div>
            )}

            {session.notes && (
              <p className="text-sm text-muted-foreground pt-2 border-t border-border">{session.notes}</p>
            )}

            {session.plannedStart && session.status === "PLANNED" && (
              <p className="text-sm text-muted-foreground">
                Prévu le{" "}
                {new Date(session.plannedStart).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </Card>
      ))}

      {sortedSessions.length === 0 && (
        <Card className="p-8 text-center bg-card border border-border">
          <p className="text-muted-foreground">Aucune séance d'entraînement</p>
          <p className="text-sm text-muted-foreground mt-1">Créez votre première séance pour commencer</p>
        </Card>
      )}
    </div>
  )
}
