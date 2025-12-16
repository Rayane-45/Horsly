import { AppHeader } from "@/components/app-header"
import { TabBar } from "@/components/tab-bar"
import { AddMedicalRecordDialog } from "@/components/add-medical-record-dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Syringe,
  Calendar,
  AlertCircle,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  Pill,
  Stethoscope,
  Activity,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MedicalTrackingPage({ params }: { params: { id: string } }) {
  const horse = {
    id: params.id,
    name: "Luna",
    image: "/beautiful-brown-horse-portrait.jpg",
  }

  const upcomingAppointments = [
    {
      id: 1,
      type: "Vermifuge",
      date: "20 Juin 2024",
      daysUntil: 7,
      veterinarian: "Dr. Martin Dubois",
      notes: "Vermifuge trimestriel",
      priority: "medium",
    },
    {
      id: 2,
      type: "Vaccination",
      date: "15 Juillet 2024",
      daysUntil: 32,
      veterinarian: "Dr. Martin Dubois",
      notes: "Rappel grippe + tétanos",
      priority: "high",
    },
    {
      id: 3,
      type: "Dentaire",
      date: "1 Août 2024",
      daysUntil: 49,
      veterinarian: "Dr. Sophie Laurent",
      notes: "Contrôle dentaire annuel",
      priority: "low",
    },
  ]

  const medicalHistory = [
    {
      id: 1,
      date: "1 Mai 2024",
      type: "Vaccination",
      description: "Vaccination grippe + tétanos",
      veterinarian: "Dr. Martin Dubois",
      product: "Equilis Prequenza Te",
      cost: 85,
      hasDocuments: true,
      nextReminder: "15 Juillet 2024",
    },
    {
      id: 2,
      date: "15 Mars 2024",
      type: "Vermifuge",
      description: "Vermifuge trimestriel",
      veterinarian: "Dr. Martin Dubois",
      product: "Eqvalan Duo",
      cost: 25,
      hasDocuments: false,
      nextReminder: "20 Juin 2024",
    },
    {
      id: 3,
      date: "10 Février 2024",
      type: "Consultation",
      description: "Contrôle dentaire - râpage des dents",
      veterinarian: "Dr. Sophie Laurent",
      product: null,
      cost: 120,
      hasDocuments: true,
      nextReminder: "1 Août 2024",
    },
    {
      id: 4,
      date: "5 Janvier 2024",
      type: "Maréchalerie",
      description: "Ferrage complet - 4 fers",
      veterinarian: "Jean Maréchal",
      product: null,
      cost: 80,
      hasDocuments: false,
      nextReminder: null,
    },
  ]

  const activeAlerts = [
    {
      type: "warning",
      message: "Vermifuge à prévoir dans 7 jours",
      date: "20 Juin 2024",
    },
  ]

  const vaccinations = [
    {
      name: "Grippe équine",
      lastDate: "1 Mai 2024",
      nextDate: "15 Juillet 2024",
      status: "up-to-date",
    },
    {
      name: "Tétanos",
      lastDate: "1 Mai 2024",
      nextDate: "15 Juillet 2024",
      status: "up-to-date",
    },
    {
      name: "Rhinopneumonie",
      lastDate: "10 Mars 2024",
      nextDate: "10 Septembre 2024",
      status: "up-to-date",
    },
  ]

  const allergies = ["Pollen de graminées", "Poussière"]

  const currentTreatments = [
    {
      name: "Complément articulaire",
      dosage: "30g par jour",
      startDate: "1 Juin 2024",
      endDate: "30 Juin 2024",
      frequency: "Quotidien",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-primary/10 text-primary border-primary/20"
      case "low":
        return "bg-muted text-muted-foreground border-muted"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppHeader title="Suivi Médical" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Horse Info */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
              <Image src={horse.image || "/placeholder.svg"} alt={horse.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{horse.name}</h2>
              <p className="text-sm text-muted-foreground">Dossier médical complet</p>
            </div>
            <Link href={`/horses/${horse.id}`}>
              <Button variant="outline" size="sm" className="border-border bg-transparent">
                Profil
              </Button>
            </Link>
          </div>
        </Card>

        {/* Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((alert, index) => (
              <Card key={index} className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Date prévue: {alert.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AddMedicalRecordDialog />

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4 bg-muted/50">
            <TabsTrigger value="upcoming" className="text-xs">
              À venir
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              Historique
            </TabsTrigger>
            <TabsTrigger value="vaccines" className="text-xs">
              Vaccins
            </TabsTrigger>
            <TabsTrigger value="treatments" className="text-xs">
              Traitements
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="p-4 bg-card border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Syringe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{appointment.type}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.veterinarian}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                    {appointment.daysUntil}j
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{appointment.date}</span>
                  </div>

                  {appointment.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{appointment.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 border-border bg-transparent hover:bg-accent">
                    Modifier
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    Marquer comme fait
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Medical History */}
          <TabsContent value="history" className="space-y-3">
            {medicalHistory.map((record) => (
              <Card key={record.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{record.type}</h3>
                        {record.hasDocuments && <FileText className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-foreground mb-1">{record.description}</p>
                      <p className="text-xs text-muted-foreground">Par {record.veterinarian}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                    {record.cost && <p className="text-sm font-semibold text-foreground mt-1">{record.cost}€</p>}
                  </div>
                </div>

                {record.product && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10 text-sm mb-2">
                    <Pill className="h-4 w-4 text-accent" />
                    <span className="text-foreground">{record.product}</span>
                  </div>
                )}

                {record.nextReminder && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Clock className="h-3 w-3" />
                    <span>Prochain rappel: {record.nextReminder}</span>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Vaccinations */}
          <TabsContent value="vaccines" className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Statut vaccinal
              </h3>
              <div className="space-y-3">
                {vaccinations.map((vaccine, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-lg bg-accent/5 border border-accent/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{vaccine.name}</h4>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />À jour
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Dernier: {vaccine.lastDate}</p>
                        <p className="text-foreground font-medium">Prochain: {vaccine.nextDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {allergies.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Allergies connues
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Current Treatments */}
          <TabsContent value="treatments" className="space-y-3">
            {currentTreatments.length > 0 ? (
              currentTreatments.map((treatment, index) => (
                <Card key={index} className="p-4 bg-card border-border">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{treatment.name}</h3>
                      <p className="text-sm text-muted-foreground">{treatment.dosage}</p>
                    </div>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                      <Activity className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fréquence</span>
                      <span className="text-foreground font-medium">{treatment.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Début</span>
                      <span className="text-foreground">{treatment.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fin prévue</span>
                      <span className="text-foreground">{treatment.endDate}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-card border-border text-center">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Aucun traitement en cours</p>
                <p className="text-sm text-muted-foreground">Les traitements actifs apparaîtront ici</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <TabBar />
    </div>
  )
}
