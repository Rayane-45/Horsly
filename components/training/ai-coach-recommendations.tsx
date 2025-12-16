"use client"

import { useTrainingStore } from "@/lib/training/store"
import { useAIRecommendations } from "@/lib/ai/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, TrendingUp } from "lucide-react"
import { ActionCards } from "@/components/ai/action-cards"

const priorityIcons = {
  CRITICAL: AlertTriangle,
  HIGH: AlertTriangle,
  MEDIUM: Info,
  LOW: Info,
}

const priorityColors = {
  CRITICAL: "border-red-500/50 bg-red-500/5",
  HIGH: "border-orange-500/50 bg-orange-500/5",
  MEDIUM: "border-blue-500/50 bg-blue-500/5",
  LOW: "border-gray-500/50 bg-gray-500/5",
}

export function AICoachRecommendations() {
  const { cards, loading, dismissCard } = useAIRecommendations("training")
  const updateRecommendation = useTrainingStore((state) => state.updateRecommendation)

  const handleFeedback = (id: string, feedback: "UP" | "DOWN") => {
    updateRecommendation(id, { feedback })
  }

  if (loading) {
    return (
      <Card className="p-8 text-center bg-card border border-border">
        <p className="text-muted-foreground">Analyse de vos entraînements en cours...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">IA Coach</h2>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {cards.length} recommandations
        </Badge>
      </div>

      {cards.length > 0 ? (
        <ActionCards cards={cards} onDismiss={dismissCard} />
      ) : (
        <Card className="p-8 text-center bg-card border border-border">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune recommandation pour le moment</p>
          <p className="text-sm text-muted-foreground mt-1">
            Continuez à entraîner pour recevoir des conseils personnalisés
          </p>
        </Card>
      )}
    </div>
  )
}
