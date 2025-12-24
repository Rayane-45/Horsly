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
  Pencil, 
  Cake, 
  Ruler, 
  Weight, 
  Dna,
  Palette,
  Tag,
  Cpu,
  User,
  Users,
  Save,
  Loader2,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Horse } from "@/app/horses/[id]/page"

interface HorseInfoTabProps {
  horse: Horse
  age?: number | null
  onUpdate: (data: Partial<Horse>) => Promise<void>
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
  unit?: string
}

function InfoItem({ icon: Icon, label, value, unit }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-medium text-foreground truncate">
          {value !== null && value !== undefined && value !== '' ? `${value}${unit ? ` ${unit}` : ""}` : "Non renseigné"}
        </p>
      </div>
    </div>
  )
}

// Convertit la hauteur stockée (mètres ou cm selon valeur) pour affichage en cm
function displayHeight(height?: number): number | null {
  if (!height) return null
  // Si la valeur est < 10, elle est probablement en mètres (ex: 1.65)
  // Si >= 10, elle est en cm (ex: 165)
  if (height < 10) {
    return Math.round(height * 100)
  }
  return Math.round(height)
}

export function HorseInfoTab({ horse, age, onUpdate }: HorseInfoTabProps) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Convertit la hauteur stockée pour l'affichage/édition en cm
  const getHeightForForm = (height?: number): string => {
    if (!height) return ""
    // Si < 10, c'est en mètres, convertir en cm
    if (height < 10) {
      return Math.round(height * 100).toString()
    }
    return Math.round(height).toString()
  }

  // Form state
  const [formData, setFormData] = useState({
    name: horse.name || "",
    breed: horse.breed || "",
    birth_date: horse.birth_date || "",
    color: horse.color || "",
    gender: horse.gender || "",
    height: getHeightForForm(horse.height),
    weight: horse.weight?.toString() || "",
    microchip_number: horse.microchip_number || "",
    registration_number: horse.registration_number || "",
    notes: horse.notes || "",
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await onUpdate({
        name: formData.name.trim(),
        breed: formData.breed.trim() || undefined,
        birth_date: formData.birth_date || undefined,
        color: formData.color.trim() || undefined,
        gender: formData.gender || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        microchip_number: formData.microchip_number.trim() || undefined,
        registration_number: formData.registration_number.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      })

      toast({
        title: "Succès",
        description: "Informations mises à jour",
      })
      setEditing(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case "male": return "Étalon"
      case "female": return "Jument"
      case "gelding": return "Hongre"
      default: return null
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="p-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Section Informations principales */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Informations générales</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEditing(true)}
            className="h-9 px-3"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Modifier
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={Cake} label="Âge" value={age ? `${age} an${age > 1 ? "s" : ""}` : null} />
          <InfoItem icon={Dna} label="Race" value={horse.breed} />
          <InfoItem icon={User} label="Sexe" value={getGenderLabel(horse.gender)} />
          <InfoItem icon={Palette} label="Robe" value={horse.color} />
          <InfoItem icon={Ruler} label="Taille" value={displayHeight(horse.height)} unit="cm" />
          <InfoItem icon={Weight} label="Poids" value={horse.weight} unit="kg" />
        </div>
      </Card>

      {/* Section Identification */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-foreground mb-4">Identification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={Cpu} label="N° Puce" value={horse.microchip_number} />
          <InfoItem icon={Tag} label="N° UELN" value={horse.registration_number} />
        </div>
      </Card>

      {/* Section Pédigrée (placeholder) */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-foreground mb-4">Pédigrée</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={User} label="Père" value={null} />
          <InfoItem icon={Users} label="Mère" value={null} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          La gestion du pédigrée sera disponible prochainement.
        </p>
      </Card>

      {/* Section Notes */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-foreground mb-3">Notes</h3>
        {horse.notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{horse.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Aucune note</p>
        )}
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les informations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du cheval"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="breed">Race</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="Ex: Selle Français"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Robe</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ex: Bai"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Sexe</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="male">Étalon</option>
                  <option value="female">Jument</option>
                  <option value="gelding">Hongre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Ex: 165"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Ex: 550"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="microchip_number">N° Puce</Label>
                <Input
                  id="microchip_number"
                  value={formData.microchip_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, microchip_number: e.target.value }))}
                  placeholder="15 chiffres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">N° UELN</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                  placeholder="Ex: 250..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes générales sur le cheval..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
