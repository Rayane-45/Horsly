"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import type { Scenario } from "@/lib/budget/types"

export function ForecastingSimulator() {
  const { scenarios, categories } = useBudgetStore()
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(scenarios[0] || null)

  const calculateScenarioTotal = (scenario: Scenario) => {
    const assumptionsTotal = scenario.assumptions.reduce((sum, a) => sum + a.annualAmount, 0)
    const eventsTotal = scenario.events.reduce((sum, e) => sum + e.amount, 0)
    return assumptionsTotal + eventsTotal
  }

  const calculateMonthlyAverage = (scenario: Scenario) => {
    return calculateScenarioTotal(scenario) / 12
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Prévisions & Simulateur</h3>
          <p className="text-sm text-muted-foreground">Planifiez votre budget annuel et créez des scénarios</p>
        </div>
        <ScenarioFormDialog
          trigger={
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau scénario
            </Button>
          }
        />
      </div>

      {scenarios.length > 0 ? (
        <Tabs defaultValue={scenarios[0]?.id} className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            {scenarios.slice(0, 3).map((scenario) => (
              <TabsTrigger key={scenario.id} value={scenario.id} onClick={() => setSelectedScenario(scenario)}>
                {scenario.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenarios.map((scenario) => (
            <TabsContent key={scenario.id} value={scenario.id} className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 bg-card border-border">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Budget Annuel Prévu</p>
                    <p className="text-3xl font-bold text-foreground">{calculateScenarioTotal(scenario).toFixed(0)}€</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Année {scenario.year}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Moyenne Mensuelle</p>
                    <p className="text-3xl font-bold text-foreground">
                      {calculateMonthlyAverage(scenario).toFixed(0)}€
                    </p>
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <TrendingUp className="h-3 w-3" />
                      <span>~{(calculateMonthlyAverage(scenario) / 30).toFixed(0)}€/jour</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Inflation Appliquée</p>
                    <p className="text-3xl font-bold text-foreground">{scenario.inflationPct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">
                      +{((calculateScenarioTotal(scenario) * scenario.inflationPct) / 100).toFixed(0)}€
                    </p>
                  </div>
                </Card>
              </div>

              {/* Assumptions by Category */}
              <Card className="p-6 bg-card border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">Prévisions par Catégorie</h4>
                <div className="space-y-3">
                  {scenario.assumptions.map((assumption, idx) => {
                    const category = categories.find((c) => c.id === assumption.categoryId)
                    const monthlyAmount = assumption.annualAmount / 12

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category?.color || "#ccc" }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{category?.label || "Catégorie"}</p>
                            <p className="text-xs text-muted-foreground">{monthlyAmount.toFixed(0)}€/mois</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{assumption.annualAmount.toFixed(0)}€</p>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Exceptional Events */}
              {scenario.events.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h4 className="text-sm font-medium text-foreground mb-4">Événements Exceptionnels</h4>
                  <div className="space-y-3">
                    {scenario.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{event.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{event.amount.toFixed(0)}€</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border bg-transparent">
                  Matérialiser les prévisions
                </Button>
                <Button variant="outline" className="flex-1 border-border bg-transparent">
                  Comparer avec {scenario.year - 1}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="p-8 bg-card border-border">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Aucun scénario créé</h4>
              <p className="text-sm text-muted-foreground">
                Créez votre premier scénario pour planifier votre budget annuel
              </p>
            </div>
            <ScenarioFormDialog
              trigger={
                <Button variant="outline" className="border-border bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un scénario
                </Button>
              }
            />
          </div>
        </Card>
      )}
    </div>
  )
}

function ScenarioFormDialog({ scenario, trigger }: { scenario?: Scenario; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { addScenario, updateScenario } = useBudgetStore()

  const [formData, setFormData] = useState({
    label: scenario?.label || "",
    year: scenario?.year || new Date().getFullYear() + 1,
    base: scenario?.base || ("COPY_LAST_YEAR" as const),
    inflationPct: scenario?.inflationPct || 3.0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const scenarioData = {
      ...formData,
      assumptions: scenario?.assumptions || [],
      events: scenario?.events || [],
    }

    if (scenario) {
      updateScenario(scenario.id, scenarioData)
    } else {
      addScenario(scenarioData)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {scenario ? "Modifier le scénario" : "Nouveau scénario"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez un budget prévisionnel pour anticiper vos dépenses futures
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-foreground">
              Nom du scénario *
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex: Budget 2026 - Réaliste"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-foreground">
                Année *
              </Label>
              <Input
                id="year"
                type="number"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="bg-card border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inflation" className="text-foreground">
                Inflation (%)
              </Label>
              <Input
                id="inflation"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.inflationPct}
                onChange={(e) => setFormData({ ...formData, inflationPct: Number(e.target.value) })}
                className="bg-card border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {scenario ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
