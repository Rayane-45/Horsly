"use client"

import type { ActionCard } from "@/lib/ai/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Info, Lightbulb, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActionCardsProps {
  cards: ActionCard[]
  onDismiss?: (cardId: string) => void
}

export function ActionCards({ cards, onDismiss }: ActionCardsProps) {
  const router = useRouter()

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Lightbulb className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>Aucune recommandation pour le moment</p>
          <p className="text-sm mt-1">Continuez votre bon travail !</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} className={getSeverityClass(card.severity)}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(card.severity)}
                <div className="flex-1">
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  {card.subtitle && <CardDescription className="mt-1">{card.subtitle}</CardDescription>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getDomainLabel(card.domain)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {card.source}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.explanation}</p>

            {card.references && card.references.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Basé sur : {card.references.join(", ")}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {card.actions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={idx === 0 ? "default" : "outline"}
                  onClick={() => router.push(action.deeplink)}
                >
                  {action.label}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              ))}
            </div>

            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={() => onDismiss(card.id)}>
                Ignorer
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function getSeverityIcon(severity: ActionCard["severity"]) {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-5 w-5 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case "advice":
      return <Lightbulb className="h-5 w-5 text-blue-500" />
    case "info":
      return <Info className="h-5 w-5 text-muted-foreground" />
  }
}

function getSeverityClass(severity: ActionCard["severity"]): string {
  switch (severity) {
    case "critical":
      return "border-destructive"
    case "warning":
      return "border-orange-500"
    case "advice":
      return "border-blue-500"
    case "info":
      return "border-border"
  }
}

function getDomainLabel(domain: ActionCard["domain"]): string {
  switch (domain) {
    case "training":
      return "Entraînement"
    case "health":
      return "Santé"
    case "budget":
      return "Budget"
  }
}
