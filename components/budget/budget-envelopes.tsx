"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, Pencil, Trash2, Loader2 } from "lucide-react"
import { useBudgetEnvelopes } from "@/hooks/use-budget-envelopes"
import { useExpensesContext } from "@/contexts/expenses-context"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  // Format français (nouveau standard)
  { value: "veterinaire", label: "Vétérinaire" },
  { value: "marechalerie", label: "Maréchal-ferrant" },
  { value: "alimentation", label: "Alimentation" },
  { value: "pension", label: "Pension" },
  { value: "entrainement", label: "Entraînement" },
  { value: "competition", label: "Compétition" },
  { value: "equipement", label: "Équipement" },
  { value: "transport", label: "Transport" },
  { value: "assurance", label: "Assurance" },
  { value: "autre", label: "Autre" },
]

// Mappage pour la rétrocompatibilité (anciennes catégories anglaises)
const CATEGORY_ALIASES: Record<string, string> = {
  vet: "veterinaire",
  farrier: "marechalerie",
  feed: "alimentation",
  boarding: "pension",
  training: "entrainement",
  equipment: "equipement",
  insurance: "assurance",
  other: "autre",
}

export function BudgetEnvelopes() {
  const { envelopes, loading: envelopesLoading, addEnvelope, updateEnvelope, deleteEnvelope } = useBudgetEnvelopes()
  const { expenses, loading: expensesLoading } = useExpensesContext()
  const { toast } = useToast()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEnvelope, setEditingEnvelope] = useState<string | null>(null)
  const [formCategory, setFormCategory] = useState("")
  const [formBudget, setFormBudget] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Current month period
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Calculate spent amount per category for current month
  const getSpentForCategory = (category: string) => {
    // Normaliser la catégorie recherchée
    const normalizedCategory = CATEGORY_ALIASES[category] || category
    
    return expenses
      .filter((e) => {
        const date = new Date(e.expense_date)
        // Normaliser la catégorie de la dépense aussi
        const expenseCategory = CATEGORY_ALIASES[e.category] || e.category
        return expenseCategory === normalizedCategory && date >= periodStart && date <= periodEnd
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const getCategoryLabel = (categoryValue: string) => {
    const cat = CATEGORIES.find(c => c.value === categoryValue)
    return cat?.label || categoryValue
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

  const getStatusIcon = (percentage: number) => {
    if (percentage > 100) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
    if (percentage >= 80) {
      return <TrendingUp className="h-4 w-4 text-primary" />
    }
    return <CheckCircle2 className="h-4 w-4 text-secondary" />
  }

  const handleOpenDialog = (envelopeId?: string) => {
    if (envelopeId) {
      const envelope = envelopes.find(e => e.id === envelopeId)
      if (envelope) {
        setEditingEnvelope(envelopeId)
        setFormCategory(envelope.category)
        setFormBudget(envelope.monthly_budget.toString())
      }
    } else {
      setEditingEnvelope(null)
      setFormCategory("")
      setFormBudget("")
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formCategory || !formBudget) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingEnvelope) {
        await updateEnvelope(editingEnvelope, {
          category: formCategory,
          monthly_budget: parseFloat(formBudget),
        })
        toast({
          title: "Enveloppe mise à jour",
          description: "Le budget a été modifié avec succès",
        })
      } else {
        await addEnvelope({
          category: formCategory,
          monthly_budget: parseFloat(formBudget),
        })
        toast({
          title: "Enveloppe créée",
          description: "Le budget a été défini avec succès",
        })
      }
      setDialogOpen(false)
      setFormCategory("")
      setFormBudget("")
      setEditingEnvelope(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette enveloppe ?")) return
    
    try {
      await deleteEnvelope(id)
      toast({
        title: "Enveloppe supprimée",
        description: "Le budget a été supprimé",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Get categories not yet used
  const availableCategories = CATEGORIES.filter(
    cat => !envelopes.some(env => env.category === cat.value) || editingEnvelope
  )

  const loading = envelopesLoading || expensesLoading

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Enveloppes Budgétaires</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border bg-transparent"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle enveloppe
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingEnvelope ? "Modifier l'enveloppe" : "Nouvelle enveloppe budgétaire"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Définissez un budget mensuel pour une catégorie de dépenses
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Catégorie</Label>
                <Select value={formCategory} onValueChange={setFormCategory} disabled={!!editingEnvelope}>
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(editingEnvelope ? CATEGORIES : availableCategories).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-foreground">Budget mensuel</Label>
                <div className="relative">
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="0.00"
                    className="pr-8 bg-card border-border text-foreground"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border bg-transparent"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEnvelope ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : envelopes.length === 0 ? (
        <Card className="p-8 bg-card border-border">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Aucune enveloppe budgétaire configurée</p>
            <p className="text-sm text-muted-foreground">
              Créez des enveloppes pour suivre vos dépenses par catégorie
            </p>
            <Button 
              variant="outline" 
              className="border-border bg-transparent mt-4"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une enveloppe
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {envelopes.map((envelope) => {
            const spent = getSpentForCategory(envelope.category)
            const remaining = envelope.monthly_budget - spent
            const percentage = envelope.monthly_budget > 0 ? (spent / envelope.monthly_budget) * 100 : 0
            const exceeded = spent > envelope.monthly_budget

            return (
              <Card key={envelope.id} className="p-4 bg-card border-border">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{getCategoryLabel(envelope.category)}</h4>
                        {getStatusIcon(percentage)}
                      </div>
                      <p className="text-xs text-muted-foreground">Budget mensuel</p>
                    </div>
                    <div className="flex items-center gap-1">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(envelope.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(envelope.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Consommé</span>
                      <span className={`font-semibold ${getStatusColor(percentage)}`}>{spent.toFixed(2)}€</span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      indicatorClassName={getProgressColor(percentage)}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-semibold text-foreground">{envelope.monthly_budget.toFixed(2)}€</span>
                    </div>
                  </div>

                  {exceeded ? (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-xs font-medium text-destructive">
                        Dépassement de {Math.abs(remaining).toFixed(2)}€
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                      <p className="text-xs font-medium text-secondary">Reste {remaining.toFixed(2)}€</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
