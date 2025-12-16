"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthStore } from "@/lib/health/store"
import { getPriorityColor } from "@/lib/health/calculations"
import { ThumbsUp, ThumbsDown, Calendar, CheckCircle2, Info, X } from "lucide-react"
import { useState } from "react"
import { HealthEventForm } from "./health-event-form"

interface RecommendationsCardsProps {
  horseId: string
}

export function RecommendationsCards({ horseId }: RecommendationsCardsProps) {
  const { recommendations, updateRecommendationFeedback, dismissRecommendation } = useHealthStore()
  const [selectedRecoId, setSelectedRecoId] = useState<string | undefined>()
  const [eventFormOpen, setEventFormOpen] = useState(false)

  const horseRecommendations = recommendations
    .filter((r) => r.horseId === horseId)
    .sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const handlePlanEvent = (recoId: string) => {
    setSelectedRecoId(recoId)
    setEventFormOpen(true)
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "DAILY":
        return "Quotidien"
      case "PERIODIC":
        return "Périodique"
      case "SEASONAL":
        return "Saisonnier"
      case "EMERGENCY":
        return "Urgence"
      case "NUTRITION":
        return "Nutrition"
      case "HYGIENE":
        return "Hygiène"
      default:
        return category
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {horseRecommendations.map((reco) => {
          const priorityColor = getPriorityColor(reco.priority)

          return (
            <Card key={reco.id} className={`p-4 border-l-4 ${priorityColor} relative`}>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => dismissRecommendation(reco.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="space-y-3 pr-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={priorityColor}>
                      {reco.priority}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(reco.category)}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{reco.title}</h3>
                </div>

                <p className="text-sm text-muted-foreground">{reco.detail}</p>

                {reco.suggestedDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Suggéré pour le{" "}
                      {new Date(reco.suggestedDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Basé sur:</span>
                  {reco.basedOn.map((basis) => (
                    <Badge key={basis} variant="secondary" className="text-xs">
                      {basis}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {reco.action === "PLAN_EVENT" && (
                    <Button size="sm" onClick={() => handlePlanEvent(reco.id)}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Programmer
                    </Button>
                  )}

                  {reco.action === "MARK_DONE" && (
                    <Button size="sm" variant="outline" onClick={() => dismissRecommendation(reco.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Fait
                    </Button>
                  )}

                  {reco.action === "READ_MORE" && (
                    <Button size="sm" variant="outline">
                      <Info className="h-4 w-4 mr-1" />
                      En savoir plus
                    </Button>
                  )}

                  <div className="flex-1" />

                  <Button
                    size="sm"
                    variant="ghost"
                    className={reco.feedback === "UP" ? "text-green-600" : ""}
                    onClick={() => updateRecommendationFeedback(reco.id, "UP")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={reco.feedback === "DOWN" ? "text-red-600" : ""}
                    onClick={() => updateRecommendationFeedback(reco.id, "DOWN")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}

        {horseRecommendations.length === 0 && (
          <Card className="p-8 text-center col-span-full">
            <p className="text-muted-foreground">Aucune recommandation pour le moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              L'IA analyse en continu les données de santé de votre cheval pour vous proposer des conseils personnalisés
            </p>
          </Card>
        )}
      </div>

      <HealthEventForm open={eventFormOpen} onOpenChange={setEventFormOpen} horseId={horseId} />
    </>
  )
}
