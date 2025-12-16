import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, AlertCircle, Calendar, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HorsesPage() {
  const horses = [
    {
      id: 1,
      name: "Luna",
      image: "/beautiful-brown-horse-portrait.jpg",
      breed: "Selle Français",
      age: "8 ans",
      height: "165 cm",
      weight: "520 kg",
      status: "healthy",
      nextEvent: "Entraînement demain 14h",
    },
    {
      id: 2,
      name: "Thunder",
      image: "/black-horse-portrait.png",
      breed: "Pur-sang",
      age: "6 ans",
      height: "172 cm",
      weight: "580 kg",
      status: "attention",
      nextEvent: "Véto vendredi 10h",
    },
  ]

  return (
    <AppLayout pageTitle="Mes Chevaux" pageSubtitle="Gérez vos chevaux et suivez leur santé, entraînements et budget.">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {horses.length} cheval{horses.length > 1 ? "x" : ""}
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un cheval
          </Button>
        </div>

        {/* Horses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {horses.map((horse) => (
            <Link key={horse.id} href={`/horses/${horse.id}`}>
              <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors h-full">
                <div className="flex flex-col gap-4">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-muted">
                    <Image src={horse.image || "/placeholder.svg"} alt={horse.name} fill className="object-cover" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-xl">{horse.name}</h3>
                        <p className="text-sm text-muted-foreground">{horse.breed}</p>
                      </div>
                      <Badge
                        variant={horse.status === "healthy" ? "secondary" : "destructive"}
                        className={
                          horse.status === "healthy"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {horse.status === "healthy" ? (
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {horse.status === "healthy" ? "OK" : "Attention"}
                      </Badge>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{horse.age}</span>
                      <span>{horse.height}</span>
                      <span>{horse.weight}</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground font-medium">{horse.nextEvent}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
