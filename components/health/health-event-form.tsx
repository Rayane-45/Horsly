"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useHealthStore } from "@/lib/health/store"
import type { HealthEvent, HealthEventCategory, Priority, RecurrenceType } from "@/lib/health/types"

interface HealthEventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: HealthEvent
  horseId: string
}

export function HealthEventForm({ open, onOpenChange, event, horseId }: HealthEventFormProps) {
  const { addEvent, updateEvent, practitioners } = useHealthStore()

  const [formData, setFormData] = useState({
    category: (event?.category || "VET_VISIT") as HealthEventCategory,
    label: event?.label || "",
    plannedDate: event?.plannedDate?.split("T")[0] || "",
    plannedTime: event?.plannedDate?.split("T")[1]?.substring(0, 5) || "10:00",
    priority: (event?.priority || "MEDIUM") as Priority,
    practitionerId: event?.practitionerId || "DEFAULT_PRACTITIONER_ID", // Updated default value
    cost: event?.cost || 0,
    budgetLinked: event?.budgetLinked ?? true,
    notes: event?.notes || "",
    recurrenceType: (event?.recurrence.type || "NONE") as RecurrenceType,
    recurrenceInterval: event?.recurrence.interval || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const plannedDate = formData.plannedDate ? `${formData.plannedDate}T${formData.plannedTime}:00Z` : undefined

    if (event) {
      updateEvent(event.id, {
        category: formData.category,
        label: formData.label,
        plannedDate,
        priority: formData.priority,
        practitionerId: formData.practitionerId || undefined,
        cost: formData.cost,
        budgetLinked: formData.budgetLinked,
        notes: formData.notes || undefined,
        recurrence: {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
        },
      })
    } else {
      addEvent({
        horseId,
        category: formData.category,
        label: formData.label,
        plannedDate,
        status: "PLANNED",
        priority: formData.priority,
        practitionerId: formData.practitionerId || undefined,
        cost: formData.cost,
        currency: "EUR",
        budgetLinked: formData.budgetLinked,
        attachments: [],
        notes: formData.notes || undefined,
        source: "USER",
        recurrence: {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
        },
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Modifier l'événement" : "Nouvel événement de santé"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Type de soin</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as HealthEventCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACCINE">Vaccination</SelectItem>
                  <SelectItem value="DEWORM">Vermifuge</SelectItem>
                  <SelectItem value="FARRIER">Maréchal-ferrant</SelectItem>
                  <SelectItem value="DENTAL">Dentiste</SelectItem>
                  <SelectItem value="VET_VISIT">Visite vétérinaire</SelectItem>
                  <SelectItem value="SURGERY">Chirurgie</SelectItem>
                  <SelectItem value="MEDICATION">Médicament</SelectItem>
                  <SelectItem value="CHECKUP">Bilan de santé</SelectItem>
                  <SelectItem value="INJURY">Blessure</SelectItem>
                  <SelectItem value="HYGIENE">Hygiène</SelectItem>
                  <SelectItem value="NUTRITION">Nutrition</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critique</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Description</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex: Vaccin grippe/tétanos"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedDate">Date prévue</Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedTime">Heure</Label>
              <Input
                id="plannedTime"
                type="time"
                value={formData.plannedTime}
                onChange={(e) => setFormData({ ...formData, plannedTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="practitioner">Intervenant</Label>
              <Select
                value={formData.practitionerId}
                onValueChange={(value) => setFormData({ ...formData, practitionerId: value })}
              >
                <SelectTrigger id="practitioner">
                  <SelectValue placeholder="Sélectionner un intervenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEFAULT_PRACTITIONER_ID">Aucun</SelectItem> // Updated value prop
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="budgetLinked"
                checked={formData.budgetLinked}
                onCheckedChange={(checked) => setFormData({ ...formData, budgetLinked: checked })}
              />
              <Label htmlFor="budgetLinked" className="cursor-pointer">
                Lier au budget
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurrenceType">Récurrence</Label>
              <Select
                value={formData.recurrenceType}
                onValueChange={(value) => setFormData({ ...formData, recurrenceType: value as RecurrenceType })}
              >
                <SelectTrigger id="recurrenceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Pas de récurrence</SelectItem>
                  <SelectItem value="WEEKLY">Chaque semaine</SelectItem>
                  <SelectItem value="MONTHLY">Chaque mois</SelectItem>
                  <SelectItem value="BIMONTHLY">Tous les 2 mois</SelectItem>
                  <SelectItem value="QUARTERLY">Tous les 3 mois</SelectItem>
                  <SelectItem value="SEMIANNUAL">Tous les 6 mois</SelectItem>
                  <SelectItem value="ANNUAL">Chaque année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recurrenceType !== "NONE" && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceInterval">Intervalle</Label>
                <Input
                  id="recurrenceInterval"
                  type="number"
                  min="1"
                  value={formData.recurrenceInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrenceInterval: Number.parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{event ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
