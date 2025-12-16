"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useHealthStore } from "@/lib/health/store"

interface VitalSignsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  horseId: string
}

export function VitalSignsForm({ open, onOpenChange, horseId }: VitalSignsFormProps) {
  const { addVitalSigns } = useHealthStore()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weightKg: "",
    bcs: "",
    temperatureC: "",
    heartBpm: "",
    respBpm: "",
    lamenessScore: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addVitalSigns({
      horseId,
      date: `${formData.date}T08:00:00Z`,
      weightKg: formData.weightKg ? Number.parseFloat(formData.weightKg) : undefined,
      bcs: formData.bcs ? Number.parseFloat(formData.bcs) : undefined,
      temperatureC: formData.temperatureC ? Number.parseFloat(formData.temperatureC) : undefined,
      heartBpm: formData.heartBpm ? Number.parseInt(formData.heartBpm) : undefined,
      respBpm: formData.respBpm ? Number.parseInt(formData.respBpm) : undefined,
      lamenessScore: formData.lamenessScore ? Number.parseInt(formData.lamenessScore) : undefined,
      notes: formData.notes || undefined,
      createdBy: "user-1", // TODO: Get from auth context
    })

    setFormData({
      date: new Date().toISOString().split("T")[0],
      weightKg: "",
      bcs: "",
      temperatureC: "",
      heartBpm: "",
      respBpm: "",
      lamenessScore: "",
      notes: "",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer les constantes</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightKg">
                Poids (kg)
                <span className="text-xs text-muted-foreground ml-2">Normal: 400-600 kg</span>
              </Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                min="0"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                placeholder="Ex: 520"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bcs">
                Note d'état corporel (BCS)
                <span className="text-xs text-muted-foreground ml-2">1-9</span>
              </Label>
              <Input
                id="bcs"
                type="number"
                step="0.5"
                min="1"
                max="9"
                value={formData.bcs}
                onChange={(e) => setFormData({ ...formData, bcs: e.target.value })}
                placeholder="Ex: 5.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperatureC">
                Température (°C)
                <span className="text-xs text-muted-foreground ml-2">Normal: 37.5-38.5</span>
              </Label>
              <Input
                id="temperatureC"
                type="number"
                step="0.1"
                min="0"
                value={formData.temperatureC}
                onChange={(e) => setFormData({ ...formData, temperatureC: e.target.value })}
                placeholder="Ex: 37.8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartBpm">
                Fréquence cardiaque (bpm)
                <span className="text-xs text-muted-foreground ml-2">Normal: 28-44</span>
              </Label>
              <Input
                id="heartBpm"
                type="number"
                min="0"
                value={formData.heartBpm}
                onChange={(e) => setFormData({ ...formData, heartBpm: e.target.value })}
                placeholder="Ex: 36"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="respBpm">
                Fréquence respiratoire (bpm)
                <span className="text-xs text-muted-foreground ml-2">Normal: 8-16</span>
              </Label>
              <Input
                id="respBpm"
                type="number"
                min="0"
                value={formData.respBpm}
                onChange={(e) => setFormData({ ...formData, respBpm: e.target.value })}
                placeholder="Ex: 12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lamenessScore">
                Score de boiterie
                <span className="text-xs text-muted-foreground ml-2">0-5</span>
              </Label>
              <Input
                id="lamenessScore"
                type="number"
                min="0"
                max="5"
                value={formData.lamenessScore}
                onChange={(e) => setFormData({ ...formData, lamenessScore: e.target.value })}
                placeholder="0 = aucune"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observations additionnelles..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
