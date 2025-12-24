"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Apple, 
  Plus, 
  Calendar,
  Package,
  Scale,
  FileText,
  Save,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HorseNutritionTabProps {
  horseId: string
  horseName: string
}

interface NutritionEntry {
  id: string
  date: string
  type: string
  quantity: string
  supplements?: string
  notes?: string
  created_at: string
}

const nutritionTypes = [
  { value: "hay", label: "Foin" },
  { value: "grain", label: "Granulés" },
  { value: "pellets", label: "Pellets" },
  { value: "grass", label: "Herbe" },
  { value: "mash", label: "Mash" },
  { value: "supplement", label: "Complément" },
  { value: "other", label: "Autre" },
]

export function HorseNutritionTab({ horseId, horseName }: HorseNutritionTabProps) {
  const { toast } = useToast()
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    quantity: "",
    supplements: "",
    notes: "",
  })

  const handleSave = async () => {
    if (!formData.type || !formData.quantity) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le type et la quantité",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    // Créer l'entrée localement (API à implémenter)
    const newEntry: NutritionEntry = {
      id: `temp-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      quantity: formData.quantity,
      supplements: formData.supplements || undefined,
      notes: formData.notes || undefined,
      created_at: new Date().toISOString(),
    }

    setEntries(prev => [newEntry, ...prev])
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "",
      quantity: "",
      supplements: "",
      notes: "",
    })
    
    setSaving(false)
    setShowDialog(false)
    
    toast({
      title: "Entrée ajoutée",
      description: "Le suivi nutritionnel sera disponible dans une prochaine version",
    })
  }

  const getTypeLabel = (type: string) => {
    return nutritionTypes.find(t => t.value === type)?.label || type
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="p-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Suivi nutritionnel</h3>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter
        </Button>
      </div>

      {entries.length === 0 ? (
        /* État vide */
        <Card className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <Apple className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Aucun suivi nutritionnel</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Suivez l'alimentation de {horseName}
            </p>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une entrée
            </Button>
          </div>
        </Card>
      ) : (
        /* Liste des entrées */
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 shrink-0">
                  <Apple className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{getTypeLabel(entry.type)}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.quantity}</p>
                  {entry.supplements && (
                    <p className="text-sm text-muted-foreground mt-1">
                      + {entry.supplements}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{entry.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une entrée nutritionnelle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="h-4 w-4 inline mr-1.5" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                <Package className="h-4 w-4 inline mr-1.5" />
                Type d'alimentation *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {nutritionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                <Scale className="h-4 w-4 inline mr-1.5" />
                Quantité *
              </Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Ex: 2 kg, 3 rations..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplements">Compléments</Label>
              <Input
                id="supplements"
                value={formData.supplements}
                onChange={(e) => setFormData(prev => ({ ...prev, supplements: e.target.value }))}
                placeholder="Ex: Vitamines, minéraux..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                <FileText className="h-4 w-4 inline mr-1.5" />
                Remarques
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes additionnelles..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={saving}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.type || !formData.quantity}
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
