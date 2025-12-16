"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import {
  calculateEnvelopeConsumption,
  calculateHealthNetCost,
  getUncategorizedOperations,
} from "@/lib/budget/calculations"

export function BudgetAlerts() {
  const { envelopes, operations, categories } = useBudgetStore()

  const alerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    title: string
    message: string
    action?: { label: string; onClick: () => void }
  }> = []

  // Current month period
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Check envelope overruns
  envelopes.forEach((envelope) => {
    const { consumed, percentage, exceeded } = calculateEnvelopeConsumption(
      envelope,
      operations,
      periodStart,
      periodEnd,
    )

    const getCategoryLabel = (categoryId?: string) => {
      const category = categories.find((c) => c.id === categoryId)
      return category?.label || "Budget"
    }

    if (exceeded && percentage > 120) {
      alerts.push({
        id: `envelope-exceeded-${envelope.id}`,
        type: "error",
        title: "Dépassement budgétaire important",
        message: `${getCategoryLabel(envelope.categoryId)} : ${consumed.toFixed(2)}€ dépensés sur ${envelope.amount.toFixed(2)}€ (${percentage.toFixed(0)}%)`,
      })
    } else if (percentage >= 90 && percentage <= 100) {
      alerts.push({
        id: `envelope-warning-${envelope.id}`,
        type: "warning",
        title: "Budget presque atteint",
        message: `${getCategoryLabel(envelope.categoryId)} : ${percentage.toFixed(0)}% du budget mensuel consommé`,
      })
    }
  })

  // Check health refunds pending
  const healthCosts = calculateHealthNetCost(operations)
  if (healthCosts.pending > 100) {
    alerts.push({
      id: "health-pending",
      type: "info",
      title: "Remboursements en attente",
      message: `${healthCosts.pending.toFixed(2)}€ de frais de santé en attente de remboursement`,
    })
  }

  // Check uncategorized operations
  const uncategorized = getUncategorizedOperations(operations)
  if (uncategorized.length > 5) {
    alerts.push({
      id: "uncategorized",
      type: "warning",
      title: "Opérations non catégorisées",
      message: `${uncategorized.length} opérations nécessitent une catégorisation`,
      action: {
        label: "Catégoriser",
        onClick: () => {
          // Navigate to operations with filter
        },
      },
    })
  }

  if (alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: (typeof alerts)[0]["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "info":
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getAlertStyles = (type: (typeof alerts)[0]["type"]) => {
    switch (type) {
      case "error":
        return "bg-destructive/5 border-destructive/20"
      case "warning":
        return "bg-orange-500/5 border-orange-500/20"
      case "info":
        return "bg-primary/5 border-primary/20"
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`p-4 ${getAlertStyles(alert.type)}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mt-1 -mr-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              {alert.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alert.action.onClick}
                  className="mt-2 border-border bg-transparent"
                >
                  {alert.action.label}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
