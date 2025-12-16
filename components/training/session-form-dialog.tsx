"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTrainingStore } from "@/lib/training/store"
import type { SessionType, SessionMode, Intensity, Surface, RecurrenceFrequency, WeekDay } from "@/lib/training/types"
import { Plus } from "lucide-react"
import { RecurrenceForm } from "./recurrence-form"
import { buildRRule } from "@/lib/training/rrule-utils"

export function SessionFormDialog() {
  const [open, setOpen] = useState(false)
  const addSession = useTrainingStore((state) => state.addSession)
  const addSeries = useTrainingStore((state) => state.addSeries)

  const [formData, setFormData] = useState({
    title: "",
    type: "EXTERIOR" as SessionType,
    mode: "MOUNTED" as SessionMode,
    intensity: "MODERATE" as Intensity,
    surface: "TRAIL" as Surface,
    plannedStart: "",
    cost: 0,
    notes: "",
  })

  const [recurrence, setRecurrence] = useState<{
    isRecurring: boolean
    freq: RecurrenceFrequency
    interval: number
    byDay: WeekDay[]
    byMonthDay?: number
    endType: "never" | "count" | "until"
    count?: number
    until?: string
  }>({
    isRecurring: false,
    freq: "WEEKLY",
    interval: 1,
    byDay: [],
    endType: "never",
    count: 10,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (recurrence.isRecurring && formData.plannedStart) {
      const rrule = buildRRule({
        freq: recurrence.freq,
        interval: recurrence.interval,
        byDay: recurrence.byDay.length > 0 ? recurrence.byDay : undefined,
        count: recurrence.endType === "count" ? recurrence.count : undefined,
        until: recurrence.endType === "until" ? recurrence.until : undefined,
      })

      const newSeries = {
        id: `series-${Date.now()}`,
        ownerId: "user-1",
        stableId: null,
        title: formData.title,
        type: formData.type,
        defaultIntensity: formData.intensity,
        defaultDurationMin: 60,
        defaultDistanceKm: null,
        notes: formData.notes || null,
        timezone: "Europe/Paris",
        startAt: new Date(formData.plannedStart).toISOString(),
        rrule,
        until: recurrence.endType === "until" ? recurrence.until || null : null,
        count: recurrence.endType === "count" ? recurrence.count || null : null,
        skipHolidays: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      addSeries(newSeries)
    } else {
      const newSession = {
        id: `sess-${Date.now()}`,
        horseId: "horse-1",
        title: formData.title,
        type: formData.type,
        mode: formData.mode,
        status: "PLANNED" as const,
        plannedStart: formData.plannedStart ? new Date(formData.plannedStart).toISOString() : null,
        plannedEnd: formData.plannedStart
          ? new Date(new Date(formData.plannedStart).getTime() + 60 * 60 * 1000).toISOString()
          : null,
        start: null,
        end: null,
        durationSec: 0,
        distanceM: 0,
        elevationPosM: 0,
        avgSpeedKmh: 0,
        maxSpeedKmh: 0,
        gpsTrackId: null,
        hrAvgBpm: 0,
        hrMaxBpm: 0,
        hrZones: [],
        gaits: { walkSec: 0, trotSec: 0, canterSec: 0, haltSec: 0 },
        intervals: [],
        calories: { horseKcal: 0, riderKcal: 0 },
        intensity: formData.intensity,
        trainingLoad: 0,
        rpe: 0,
        surface: formData.surface,
        weather: null,
        notes: formData.notes || null,
        attachments: [],
        cost: formData.cost,
        currency: "EUR",
        budgetLinked: formData.cost > 0,
        budgetOperationId: null,
        shareableImageId: null,
        source: "MANUAL" as const,
        externalRef: null,
        clubId: null,
        createdBy: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      addSession(newSession)
    }

    setOpen(false)
    setFormData({
      title: "",
      type: "EXTERIOR",
      mode: "MOUNTED",
      intensity: "MODERATE",
      surface: "TRAIL",
      plannedStart: "",
      cost: 0,
      notes: "",
    })
    setRecurrence({
      isRecurring: false,
      freq: "WEEKLY",
      interval: 1,
      byDay: [],
      endType: "never",
      count: 10,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle séance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Planifier une séance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Trotting forêt"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as SessionType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRESSAGE">Dressage</SelectItem>
                  <SelectItem value="EXTERIOR">Extérieur</SelectItem>
                  <SelectItem value="ENDURANCE">Endurance</SelectItem>
                  <SelectItem value="CSO">CSO</SelectItem>
                  <SelectItem value="LEISURE">Balade loisir</SelectItem>
                  <SelectItem value="WESTERN">Western</SelectItem>
                  <SelectItem value="DRIVING">Attelage</SelectItem>
                  <SelectItem value="LONGE">Longe</SelectItem>
                  <SelectItem value="RECOVERY">Récupération</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => setFormData({ ...formData, mode: value as SessionMode })}
              >
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOUNTED">Monté</SelectItem>
                  <SelectItem value="IN_HAND">À pied</SelectItem>
                  <SelectItem value="DRIVING">Attelé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensité</Label>
              <Select
                value={formData.intensity}
                onValueChange={(value) => setFormData({ ...formData, intensity: value as Intensity })}
              >
                <SelectTrigger id="intensity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Facile</SelectItem>
                  <SelectItem value="MODERATE">Modéré</SelectItem>
                  <SelectItem value="HARD">Intense</SelectItem>
                  <SelectItem value="MAX">Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface">Sol</Label>
              <Select
                value={formData.surface || ""}
                onValueChange={(value) => setFormData({ ...formData, surface: value as Surface })}
              >
                <SelectTrigger id="surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARENA_SAND">Carrière sable</SelectItem>
                  <SelectItem value="GRASS">Herbe</SelectItem>
                  <SelectItem value="TRACK">Piste</SelectItem>
                  <SelectItem value="ROAD">Route</SelectItem>
                  <SelectItem value="TRAIL">Chemin</SelectItem>
                  <SelectItem value="MIXED">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedStart">Date et heure prévue</Label>
            <Input
              id="plannedStart"
              type="datetime-local"
              value={formData.plannedStart}
              onChange={(e) => setFormData({ ...formData, plannedStart: e.target.value })}
            />
          </div>

          {formData.plannedStart && (
            <RecurrenceForm
              value={recurrence}
              startAt={new Date(formData.plannedStart).toISOString()}
              onChange={setRecurrence}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="cost">Coût (€)</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Remarques, objectifs..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              {recurrence.isRecurring ? "Créer série" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
