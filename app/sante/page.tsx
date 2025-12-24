"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useHealthEvents, HealthEvent } from "@/hooks/use-health-events"
import { useHorses } from "@/hooks/use-horses"
import { AddMedicalRecordDialog } from "@/components/add-medical-record-dialog"
import { AppLayout } from "@/components/layout/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { HorseSelector } from "@/components/horse-selector"
import {
  Plus,
  Activity,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Stethoscope,
  Syringe,
} from "lucide-react"

export default function SantePage() {
  const { events, loading, error, deleteEvent, refetch } = useHealthEvents()
  const { horses, loading: horsesLoading } = useHorses()
  const [selectedHorseId, setSelectedHorseId] = useState<string>("all")

  // Filter events by selected horse
  const filteredEvents = useMemo(() => {
    if (selectedHorseId === "all") return events
    return events.filter((e) => e.horse_id === selectedHorseId)
  }, [events, selectedHorseId])

  // Calculate dashboard stats
  const dashboard = useMemo(() => {
    const now = new Date()
    const vaccinations = filteredEvents.filter((e) => e.event_type === "vaccine")
    const dewormings = filteredEvents.filter((e) => e.event_type === "deworming")
    const vetVisits = filteredEvents.filter((e) => e.event_type === "vet")

    // Check for overdue vaccinations (> 1 year since last)
    const lastVaccine = vaccinations.sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    )[0]
    const vaccineOverdue = lastVaccine
      ? new Date(lastVaccine.event_date).getTime() < now.getTime() - 365 * 24 * 60 * 60 * 1000
      : false

    // Check for overdue deworming (> 3 months since last)
    const lastDeworming = dewormings.sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    )[0]
    const dewormOverdue = lastDeworming
      ? new Date(lastDeworming.event_date).getTime() < now.getTime() - 90 * 24 * 60 * 60 * 1000
      : false

    // Upcoming events (with next_due_date in next 30 days)
    const upcomingEvents = filteredEvents.filter((e) => {
      if (!e.next_due_date) return false
      const dueDate = new Date(e.next_due_date)
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      return dueDate >= now && dueDate <= in30Days
    })

    // Total cost this year
    const thisYearCost = filteredEvents
      .filter((e) => new Date(e.event_date).getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + (e.cost || 0), 0)

    return {
      vaccineCount: vaccinations.length,
      vaccineStatus: vaccinations.length === 0 ? "WARNING" : vaccineOverdue ? "OVERDUE" : "OK",
      dewormCount: dewormings.length,
      dewormStatus: dewormings.length === 0 ? "WARNING" : dewormOverdue ? "OVERDUE" : "OK",
      vetVisitCount: vetVisits.length,
      totalEvents: filteredEvents.length,
      upcomingEvents,
      thisYearCost,
      overdueCount: (vaccineOverdue ? 1 : 0) + (dewormOverdue ? 1 : 0),
    }
  }, [filteredEvents])

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
            À faire
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

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vet: "Vétérinaire",
      farrier: "Maréchal-ferrant",
      vaccine: "Vaccination",
      deworming: "Vermifuge",
      dental: "Dentiste",
      injury: "Blessure",
      illness: "Maladie",
      other: "Autre",
    }
    return labels[type] || type
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "vaccine":
        return <Syringe className="h-4 w-4" />
      case "vet":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vet: "bg-blue-100 text-blue-800",
      farrier: "bg-orange-100 text-orange-800",
      vaccine: "bg-green-100 text-green-800",
      deworming: "bg-purple-100 text-purple-800",
      dental: "bg-cyan-100 text-cyan-800",
      injury: "bg-red-100 text-red-800",
      illness: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement de santé ?")) {
      try {
        await deleteEvent(id)
      } catch (err) {
        console.error("Erreur lors de la suppression:", err)
      }
    }
  }

  return (
    <AppLayout pageTitle="Santé" pageSubtitle="Suivi médical et recommandations personnalisées">
      <div className="space-y-6">
        {/* Horse Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <HorseSelector
            value={selectedHorseId}
            onValueChange={setSelectedHorseId}
            showAllOption={true}
            label="Cheval"
          />
          <AddMedicalRecordDialog onSuccess={refetch} />
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <Syringe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Vaccins</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{dashboard.vaccineCount}</p>
                <div className="mt-1">{getStatusBadge(dashboard.vaccineStatus as any)}</div>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Vermifuges</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{dashboard.dewormCount}</p>
                <div className="mt-1">{getStatusBadge(dashboard.dewormStatus as any)}</div>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Visites véto</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{dashboard.vetVisitCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total enregistré</p>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Coût annuel</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{dashboard.thisYearCost.toFixed(0)}€</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{new Date().getFullYear()}</p>
              </>
            )}
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
                  <p className="text-sm text-red-700">Consultez les soins pour planifier les rappels manquants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">
              <Calendar className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <FileText className="h-4 w-4 mr-2" />
              À venir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Chargement des événements...</span>
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun événement de santé enregistré</p>
                <p className="text-sm mt-1">
                  Commencez par ajouter une visite vétérinaire, une vaccination ou un vermifuge
                </p>
                <div className="mt-4">
                  <AddMedicalRecordDialog onSuccess={refetch} />
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredEvents
                  .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                  .map((event) => (
                    <Card key={event.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getEventTypeIcon(event.event_type)}
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.event_date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <span>•</span>
                            <span>{event.horses?.name || "Cheval inconnu"}</span>
                            {event.cost && (
                              <>
                                <span>•</span>
                                <span className="font-medium">{event.cost}€</span>
                              </>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                          )}
                          {event.veterinarian_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Praticien : {event.veterinarian_name}
                            </p>
                          )}
                          {event.next_due_date && (
                            <p className="text-xs text-primary mt-1">
                              Prochain rappel :{" "}
                              {new Date(event.next_due_date).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
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
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.horses?.name} -{" "}
                            {event.next_due_date &&
                              new Date(event.next_due_date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                              })}
                          </p>
                        </div>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
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

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.vaccineStatus !== "OK" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-900">Vaccination</p>
                    <p className="text-sm text-yellow-700">
                      {dashboard.vaccineCount === 0
                        ? "Aucune vaccination enregistrée. Pensez à vacciner vos chevaux."
                        : "Une vaccination pourrait être due. Vérifiez les dates de rappel."}
                    </p>
                  </div>
                )}
                {dashboard.dewormStatus !== "OK" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-900">Vermifuge</p>
                    <p className="text-sm text-yellow-700">
                      {dashboard.dewormCount === 0
                        ? "Aucun vermifuge enregistré. Un programme de vermifugation régulier est recommandé."
                        : "Un vermifuge pourrait être nécessaire (dernier > 3 mois)."}
                    </p>
                  </div>
                )}
                {dashboard.vaccineStatus === "OK" && dashboard.dewormStatus === "OK" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-900">Tout est à jour !</p>
                    <p className="text-sm text-green-700">
                      Les vaccinations et vermifuges sont à jour. Continuez ainsi !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
