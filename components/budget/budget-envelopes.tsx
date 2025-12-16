"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import { calculateEnvelopeConsumption } from "@/lib/budget/calculations"

export function BudgetEnvelopes() {
  const { envelopes, operations, categories } = useBudgetStore()

  const horses = [
    { id: "1", name: "Luna" },
    { id: "2", name: "Thunder" },
  ]

  // Current month period
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return ""
    const category = categories.find((c) => c.id === categoryId)
    return category?.label || ""
  }

  const getHorseName = (horseId?: string) => {
    if (!horseId) return ""
    const horse = horses.find((h) => h.id === horseId)
    return horse?.name || ""
  }

  const getEnvelopeLabel = (envelope: (typeof envelopes)[0]) => {
    if (envelope.scope === "CATEGORY") {
      return getCategoryLabel(envelope.categoryId)
    }
    if (envelope.scope === "HORSE") {
      return getHorseName(envelope.horseId)
    }
    if (envelope.scope === "HORSE_CATEGORY") {
      return `${getHorseName(envelope.horseId)} - ${getCategoryLabel(envelope.categoryId)}`
    }
    return "Budget Global"
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 80) return "text-secondary"
    if (percentage < 100) return "text-primary"
    if (percentage < 120) return "text-orange-500"
    return "text-destructive"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 80) return "bg-secondary"
    if (percentage < 100) return "bg-primary"
    if (percentage < 120) return "bg-orange-500"
    return "bg-destructive"
  }

  const getStatusIcon = (percentage: number, exceeded: boolean) => {
    if (exceeded && percentage > 120) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
    if (percentage >= 80 && percentage < 100) {
      return <TrendingUp className="h-4 w-4 text-primary" />
    }
    if (percentage < 80) {
      return <CheckCircle2 className="h-4 w-4 text-secondary" />
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Enveloppes Budgétaires</h3>
        <Button variant="outline" size="sm" className="border-border bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle enveloppe
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {envelopes.map((envelope) => {
          const { consumed, remaining, percentage, exceeded } = calculateEnvelopeConsumption(
            envelope,
            operations,
            periodStart,
            periodEnd,
          )

          return (
            <Card key={envelope.id} className="p-4 bg-card border-border">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{getEnvelopeLabel(envelope)}</h4>
                      {getStatusIcon(percentage, exceeded)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {envelope.periodicity === "MONTHLY" && "Mensuel"}
                      {envelope.periodicity === "WEEKLY" && "Hebdomadaire"}
                      {envelope.periodicity === "QUARTERLY" && "Trimestriel"}
                      {envelope.periodicity === "YEARLY" && "Annuel"}
                    </p>
                  </div>
                  <Badge
                    variant={exceeded ? "destructive" : "secondary"}
                    className={
                      exceeded
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-secondary/10 text-secondary border-secondary/20"
                    }
                  >
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consommé</span>
                    <span className={`font-semibold ${getStatusColor(percentage)}`}>{consumed.toFixed(2)}€</span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className="h-2"
                    indicatorClassName={getProgressColor(percentage)}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-semibold text-foreground">{envelope.amount.toFixed(2)}€</span>
                  </div>
                </div>

                {exceeded ? (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-xs font-medium text-destructive">
                      Dépassement de {(consumed - envelope.amount).toFixed(2)}€
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <p className="text-xs font-medium text-secondary">Reste {remaining.toFixed(2)}€</p>
                  </div>
                )}

                {envelope.carryOver && <p className="text-xs text-muted-foreground">Report du solde activé</p>}
              </div>
            </Card>
          )
        })}
      </div>

      {envelopes.length === 0 && (
        <Card className="p-8 bg-card border-border">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Aucune enveloppe budgétaire configurée</p>
            <Button variant="outline" className="border-border bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Créer une enveloppe
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
