"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, GripVertical, Edit, Trash2, Play } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import { testRuleOnOperations } from "@/lib/budget/automation"
import type { AutomationRule } from "@/lib/budget/types"

export function AutomationRules() {
  const { rules, operations, categories, updateRule, deleteRule, reorderRules } = useBudgetStore()
  const [testResults, setTestResults] = useState<{ ruleId: string; matchCount: number } | null>(null)

  const handleTestRule = (rule: AutomationRule) => {
    const { matches } = testRuleOnOperations(rule, operations)
    setTestResults({ ruleId: rule.id, matchCount: matches.length })
    setTimeout(() => setTestResults(null), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Règles d'automatisation</h3>
          <p className="text-sm text-muted-foreground">Automatisez la catégorisation et le traitement des opérations</p>
        </div>
        <RuleFormDialog
          trigger={
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle règle
            </Button>
          }
        />
      </div>

      <div className="space-y-3">
        {rules
          .sort((a, b) => a.priority - b.priority)
          .map((rule, index) => (
            <Card key={rule.id} className="p-4 bg-card border-border">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1 cursor-move">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{rule.name}</h4>
                        <Badge variant="outline" className="border-border text-xs">
                          Priorité {rule.priority}
                        </Badge>
                        {!rule.enabled && (
                          <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground text-xs">
                            Désactivée
                          </Badge>
                        )}
                      </div>
                      {testResults?.ruleId === rule.id && (
                        <p className="text-xs text-primary">
                          {testResults.matchCount} opération{testResults.matchCount > 1 ? "s" : ""} correspondante
                          {testResults.matchCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.conditions.map((condition, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-secondary/10 text-secondary border-secondary/20 text-xs"
                          >
                            {condition.field} {condition.op.toLowerCase()}{" "}
                            {condition.value || `${condition.min}-${condition.max}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.actions.map((action, idx) => (
                          <Badge key={idx} variant="outline" className="border-primary/20 text-primary text-xs">
                            {action.type === "SET_CATEGORY" &&
                              `Catégorie: ${categories.find((c) => c.id === action.categoryId)?.label}`}
                            {action.type === "ADD_TAG" && `Tag: ${action.value}`}
                            {action.type === "SET_RECONCILIATION" && `Rapprochement: ${action.value}`}
                            {action.type === "SET_RIDER" && `Cavalier: ${action.riderId}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleTestRule(rule)} className="border-border">
                      <Play className="h-3 w-3 mr-1" />
                      Tester
                    </Button>
                    <RuleFormDialog
                      rule={rule}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {rules.length === 0 && (
        <Card className="p-8 bg-card border-border">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Aucune règle d'automatisation configurée</p>
            <RuleFormDialog
              trigger={
                <Button variant="outline" className="border-border bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une règle
                </Button>
              }
            />
          </div>
        </Card>
      )}
    </div>
  )
}

function RuleFormDialog({ rule, trigger }: { rule?: AutomationRule; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { addRule, updateRule, categories } = useBudgetStore()

  const [formData, setFormData] = useState({
    name: rule?.name || "",
    enabled: rule?.enabled ?? true,
    priority: rule?.priority || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const ruleData = {
      ...formData,
      conditions: rule?.conditions || [],
      actions: rule?.actions || [],
    }

    if (rule) {
      updateRule(rule.id, ruleData)
    } else {
      addRule(ruleData)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{rule ? "Modifier la règle" : "Nouvelle règle"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez des règles pour automatiser le traitement de vos opérations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nom de la règle *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Auto-catégoriser pension"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-foreground">
                Priorité
              </Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="bg-card border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Les règles avec priorité plus basse s'exécutent en premier
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/10">
              <Label htmlFor="enabled" className="text-foreground font-medium">
                Règle active
              </Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
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
              {rule ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
