import { AppLayout } from "@/components/layout/app-layout"
import { IdentityHero } from "@/components/horses/identity-hero"
import { StatTile } from "@/components/horses/stat-tile"
import { UpcomingEventsList } from "@/components/horses/upcoming-events-list"
import { InfoCard } from "@/components/horses/info-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cake, Ruler, Weight, DollarSign, Activity, Syringe, Plus, Heart } from "lucide-react"
import Link from "next/link"

export default function HorseProfilePage({ params }: { params: { id: string } }) {
  // Mock data - would come from database via TanStack Query
  const horse = {
    id: params.id,
    name: "Luna",
    image: "/beautiful-brown-horse-portrait.jpg",
    breed: "Selle Français",
    birthDate: new Date("2016-03-15"),
    age: 8,
    height: 165,
    weight: 520,
    pensionMonthly: 450,
    microchip: "250268500123456",
    healthStatus: "healthy" as const,
    location: "Écurie des Pins, Fontainebleau",
    vetName: "Dr. Martin Dubois",
    vetPhone: "+33 6 12 34 56 78",
    notes: "Sensible aux changements de temps. Préfère les entraînements matinaux.",
  }

  const upcomingEvents = [
    {
      id: "1",
      type: "training" as const,
      title: "Entraînement dressage",
      dueAt: new Date(Date.now() + 86400000), // Tomorrow
    },
    {
      id: "2",
      type: "competition" as const,
      title: "Concours régional",
      dueAt: new Date(Date.now() + 5 * 86400000), // In 5 days
    },
    {
      id: "3",
      type: "medical" as const,
      title: "Rappel vermifuge",
      dueAt: new Date(Date.now() + 10 * 86400000), // In 10 days
    },
  ]

  const recentTraining = [
    { id: "1", date: "10 Juin", type: "Dressage", duration: "45 min", intensity: "Modéré", distance: "8 km" },
    { id: "2", date: "8 Juin", type: "Saut d'obstacles", duration: "60 min", intensity: "Intense", distance: "5 km" },
    { id: "3", date: "6 Juin", type: "Cross", duration: "50 min", intensity: "Modéré", distance: "12 km" },
  ]

  const medicalHistory = [
    { id: "1", date: "1 Mai 2024", type: "Vaccination", description: "Grippe + Tétanos", vet: "Dr. Dubois", cost: 85 },
    { id: "2", date: "15 Mars 2024", type: "Vermifuge", description: "Eqvalan Duo", vet: "Dr. Dubois", cost: 25 },
    {
      id: "3",
      date: "10 Fév 2024",
      type: "Dentisterie",
      description: "Contrôle dentaire",
      vet: "Dr. Dubois",
      cost: 120,
    },
  ]

  const monthlyExpenses = [
    { category: "Pension", amount: 450, percentage: 56 },
    { category: "Vétérinaire", amount: 120, percentage: 15 },
    { category: "Maréchal", amount: 80, percentage: 10 },
    { category: "Alimentation", amount: 150, percentage: 19 },
  ]

  const totalExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <AppLayout pageTitle={horse.name} pageSubtitle={`${horse.breed}, ${horse.age} ans`}>
      {/* Desktop: 2-column layout, Mobile: single column */}
      <div className="space-y-6">
        {/* Hero Section */}
        <IdentityHero
          name={horse.name}
          breed={horse.breed}
          image={horse.image}
          healthStatus={horse.healthStatus}
          onPhotoChange={(file) => console.log("[v0] Photo upload:", file.name)}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile icon={Cake} label="Âge" value={`${horse.age} ans`} />
          <StatTile icon={Ruler} label="Taille" value={`${horse.height} cm`} />
          <StatTile icon={Weight} label="Poids" value={`${horse.weight} kg`} />
          <StatTile icon={DollarSign} label="Pension" value={`${horse.pensionMonthly}€/mois`} />
        </div>

        {/* Main Content: 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tabs (66% on desktop) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="w-full grid grid-cols-4 bg-muted/50">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="training">Entraînements</TabsTrigger>
                <TabsTrigger value="medical">Médical</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                {/* Health Summary */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    État de santé
                  </h3>
                  <Card className="p-4 bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-secondary fill-current" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Tout va bien</p>
                        <p className="text-sm text-muted-foreground">Aucun problème détecté</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">• Vermifuge prévu dans 10 jours</p>
                      <p className="text-foreground">• Ferrure à jour</p>
                      <p className="text-foreground">• Vaccins à jour</p>
                    </div>
                  </Card>
                </section>

                {/* Recent Training */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Derniers entraînements
                    </h3>
                    <Link href="/training">
                      <Button variant="ghost" size="sm" className="text-primary h-8">
                        Voir tout
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {recentTraining.slice(0, 3).map((session) => (
                      <Card key={session.id} className="p-4 bg-card border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground">{session.type}</p>
                            <p className="text-xs text-muted-foreground">{session.date}</p>
                          </div>
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                            {session.intensity}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{session.duration}</span>
                          <span>{session.distance}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Budget Summary */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Budget du mois
                  </h3>
                  <Card className="p-4 bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-foreground">{totalExpenses}€</span>
                    </div>
                    <div className="space-y-3">
                      {monthlyExpenses.map((expense, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-foreground">{expense.category}</span>
                            <span className="font-semibold text-foreground">{expense.amount}€</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${expense.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Syringe className="h-4 w-4 mr-2" />
                    Planifier un soin
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Activity className="h-4 w-4 mr-2" />
                    Enregistrer un entraînement
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Ajouter une dépense
                  </Button>
                </div>
              </TabsContent>

              {/* Training Tab */}
              <TabsContent value="training" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Entraînements récents
                  </h3>
                  <Link href="/training">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {recentTraining.map((session) => (
                    <Card
                      key={session.id}
                      className="p-4 bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-foreground">{session.type}</p>
                          <p className="text-xs text-muted-foreground">{session.date}</p>
                        </div>
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                          {session.intensity}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Durée</p>
                          <p className="text-foreground font-medium">{session.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Distance</p>
                          <p className="text-foreground font-medium">{session.distance}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel entraînement
                </Button>
              </TabsContent>

              {/* Medical Tab */}
              <TabsContent value="medical" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Historique médical
                  </h3>
                  <Link href="/sante">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {medicalHistory.map((record) => (
                    <Card
                      key={record.id}
                      className="p-4 bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Syringe className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-foreground text-sm">{record.type}</p>
                            <p className="text-xs text-muted-foreground">{record.date}</p>
                          </div>
                          <p className="text-sm text-foreground mb-1">{record.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Par {record.vet}</p>
                            <p className="text-sm font-semibold text-foreground">{record.cost}€</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau soin
                </Button>
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Dépenses mensuelles
                  </h3>
                  <p className="text-2xl font-bold text-foreground">{totalExpenses}€</p>
                </div>

                <Card className="p-4 bg-card border border-border space-y-3">
                  {monthlyExpenses.map((expense, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">{expense.category}</span>
                        <span className="text-foreground font-semibold">{expense.amount}€</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${expense.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </Card>

                <Link href="/budget">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Activity className="h-4 w-4 mr-2" />
                    Voir le budget complet
                  </Button>
                </Link>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Upcoming Events + Info (34% on desktop) */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Prochains événements
              </h3>
              <UpcomingEventsList events={upcomingEvents} limit={3} />
            </section>

            {/* Information Card */}
            <section>
              <InfoCard
                location={horse.location}
                vetName={horse.vetName}
                vetPhone={horse.vetPhone}
                chipId={horse.microchip}
                notes={horse.notes}
                onEdit={() => console.log("[v0] Edit horse info")}
              />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
