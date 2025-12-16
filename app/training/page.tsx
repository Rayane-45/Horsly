"use client"

import { SessionFormDialog } from "@/components/training/session-form-dialog"
import { SessionTimeline } from "@/components/training/session-timeline"
import { AICoachRecommendations } from "@/components/training/ai-coach-recommendations"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTrainingStore } from "@/lib/training/store"
import { calculateWeeklyLoad, formatDuration } from "@/lib/training/calculations"
import { Clock, Activity, MapPin, Zap, Play } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { TrainingCalendar } from "@/components/training/training-calendar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TrainingPage() {
  const router = useRouter()
  const sessions = useTrainingStore((state) => state.sessions)

  // Calculate stats
  const doneSessions = sessions.filter((s) => s.status === "DONE")
  const thisWeekSessions = doneSessions.filter((s) => {
    const sessionDate = new Date(s.end!)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return sessionDate >= weekAgo
  })

  const totalDuration = thisWeekSessions.reduce((sum, s) => sum + s.durationSec, 0)
  const totalDistance = thisWeekSessions.reduce((sum, s) => sum + s.distanceM, 0)
  const avgHR =
    thisWeekSessions.length > 0
      ? Math.round(thisWeekSessions.reduce((sum, s) => sum + s.hrAvgBpm, 0) / thisWeekSessions.length)
      : 0

  const weeklyLoad = calculateWeeklyLoad(sessions)

  return (
    <AppLayout pageTitle="Entraînements" pageSubtitle="Suivi des séances et recommandations du coach IA">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Temps total</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{formatDuration(totalDuration)}</p>
            <p className="text-xs text-muted-foreground mt-1">{thisWeekSessions.length} séances</p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Distance</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{(totalDistance / 1000).toFixed(1)} km</p>
            <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">FC moyenne</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{avgHR} bpm</p>
            <p className="text-xs text-muted-foreground mt-1">Cardio</p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Charge</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{weeklyLoad.currentWeek}</p>
            <p className={`text-xs mt-1 ${weeklyLoad.overload ? "text-destructive" : "text-secondary"}`}>
              {weeklyLoad.change > 0 ? "+" : ""}
              {weeklyLoad.change.toFixed(0)}% vs semaine dernière
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button size="lg" onClick={() => router.push("/training/live")} className="w-full">
            <Play className="h-5 w-5 mr-2" />
            Nouvelle séance en direct
          </Button>
          <SessionFormDialog />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="coach">IA Coach</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <SessionTimeline />
          </TabsContent>

          <TabsContent value="coach" className="space-y-4">
            <AICoachRecommendations />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <TrainingCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
