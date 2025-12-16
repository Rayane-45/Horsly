"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useHealthStore } from "@/lib/health/store"
import { calculateHealthDashboard } from "@/lib/health/calculations"
import { generateRecommendations } from "@/lib/health/smart-assistant"
import { HealthEventForm } from "@/components/health/health-event-form"
import { HealthTimeline } from "@/components/health/health-timeline"
import { VitalSignsForm } from "@/components/health/vital-signs-form"
import { VitalsCharts } from "@/components/health/vitals-charts"
import { ObservationsJournal } from "@/components/health/observations-journal"
import { RecommendationsCards } from "@/components/health/recommendations-cards"
import { AppLayout } from "@/components/layout/app-layout"
import { ShareHealthRecord } from "@/components/health/share-health-record"
import {
  Plus,
  Activity,
  Calendar,
  FileText,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Thermometer,
} from "lucide-react"

export default function SantePage() {
  const { events, vaccinations, dewormings, vitalSigns, observations } = useHealthStore()
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [vitalsFormOpen, setVitalsFormOpen] = useState(false)

  // Mock horse ID - in real app, this would come from route params or context
  const horseId = "horse-1"
  const horseProfile = "ADULT" // This would come from horse data

  // Calculate dashboard data
  const dashboard = calculateHealthDashboard(events, vaccinations, dewormings, vitalSigns, horseId)

  // Generate AI recommendations
  const aiRecommendations = generateRecommendations({
    id: horseId,
    profile: horseProfile,
    age: 8,
    events,
    vaccinations,
    dewormings,
    vitalSigns,
  })

  const getStatusBadge = (status: "OK" | "WARNING" | "OVERDUE") => {
    switch (status) {
      case "OK":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />À jour
          </Badge>
        )
      case "WARNING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Attention
          </Badge>
        )
      case "OVERDUE":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            En retard
          </Badge>
        )
    }
  }

  return (
    <AppLayout pageTitle="Santé" pageSubtitle="Suivi médical et recommandations personnalisées">
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <ShareHealthRecord horseId={horseId} />
          <Button onClick={() => setVitalsFormOpen(true)} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Constantes
          </Button>
          <Button onClick={() => setEventFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau soin
          </Button>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Vaccins</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {vaccinations.filter((v) => v.horseId === horseId).length}
            </p>
            <div className="mt-1">{getStatusBadge(dashboard.vaccineStatus)}</div>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Vermifuges</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {dewormings.filter((d) => d.horseId === horseId).length}
            </p>
            <div className="mt-1">{getStatusBadge(dashboard.dewormStatus)}</div>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Poids actuel</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {dashboard.recentVitals?.weightKg ? `${dashboard.recentVitals.weightKg} kg` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.recentVitals?.bcs ? `BCS: ${dashboard.recentVitals.bcs}/9` : "Non mesuré"}
            </p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs font-medium">Température</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {dashboard.recentVitals?.temperatureC ? `${dashboard.recentVitals.temperatureC}°C` : "N/A"}
            </p>
            <p
              className={`text-xs mt-1 ${
                dashboard.recentVitals?.temperatureC && dashboard.recentVitals.temperatureC > 38.5
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {dashboard.recentVitals?.temperatureC
                ? dashboard.recentVitals.temperatureC > 38.5
                  ? "Élevée"
                  : "Normale"
                : "Non mesurée"}
            </p>
          </Card>
        </div>

        {/* Alerts */}
        {dashboard.overdueCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    {dashboard.overdueCount} soin{dashboard.overdueCount > 1 ? "s" : ""} en retard
                  </p>
                  <p className="text-sm text-red-700">Consultez la timeline pour planifier les soins manquants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
              <span className="sm:hidden">Vue</span>
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden">Soins</span>
            </TabsTrigger>
            <TabsTrigger value="vitals">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Constantes</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="observations">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Journal</span>
              <span className="sm:hidden">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Recommandations IA</span>
              <span className="sm:hidden">IA</span>
              {aiRecommendations.length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  {aiRecommendations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prochains soins (30 jours)</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard.upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{event.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.plannedDate &&
                                new Date(event.plannedDate).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                })}
                            </p>
                          </div>
                          <Badge>{event.category}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun soin prévu dans les 30 prochains jours
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observations récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {observations.filter((o) => o.horseId === horseId).length > 0 ? (
                    <div className="space-y-3">
                      {observations
                        .filter((o) => o.horseId === horseId)
                        .slice(0, 3)
                        .map((obs) => (
                          <div key={obs.id} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-foreground">{obs.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(obs.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Aucune observation récente</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <VitalsCharts horseId={horseId} />
          </TabsContent>

          <TabsContent value="timeline">
            <HealthTimeline horseId={horseId} />
          </TabsContent>

          <TabsContent value="vitals">
            <VitalsCharts horseId={horseId} />
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des constantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vitalSigns
                      .filter((v) => v.horseId === horseId)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 10)
                      .map((vital) => (
                        <div key={vital.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(vital.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            {vital.notes && <p className="text-xs text-muted-foreground mt-1">{vital.notes}</p>}
                          </div>
                          <div className="flex gap-4 text-sm">
                            {vital.weightKg && <span className="text-foreground">{vital.weightKg} kg</span>}
                            {vital.temperatureC && <span className="text-foreground">{vital.temperatureC}°C</span>}
                            {vital.bcs && <span className="text-muted-foreground">BCS: {vital.bcs}</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="observations">
            <ObservationsJournal horseId={horseId} />
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="mb-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Assistant IA de santé équine</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ces recommandations sont générées automatiquement en fonction du profil de votre cheval, de la
                        saison, de son historique médical et de ses constantes vitales. Elles vous aident à anticiper
                        les soins et à maintenir votre cheval en pleine santé.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <RecommendationsCards horseId={horseId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Forms */}
      <HealthEventForm open={eventFormOpen} onOpenChange={setEventFormOpen} horseId={horseId} />
      <VitalSignsForm open={vitalsFormOpen} onOpenChange={setVitalsFormOpen} horseId={horseId} />
    </AppLayout>
  )
}
