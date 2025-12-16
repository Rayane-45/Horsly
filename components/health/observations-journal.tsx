"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHealthStore } from "@/lib/health/store"
import { getPriorityColor } from "@/lib/health/calculations"
import type { ObservationType, Priority } from "@/lib/health/types"
import { AlertCircle, FileText, Droplets, Utensils, Activity } from "lucide-react"

interface ObservationsJournalProps {
  horseId: string
}

export function ObservationsJournal({ horseId }: ObservationsJournalProps) {
  const { observations, addObservation } = useHealthStore()
  const [newObservation, setNewObservation] = useState({
    type: "NOTE" as ObservationType,
    text: "",
    priority: "LOW" as Priority,
  })

  const horseObservations = observations
    .filter((o) => o.horseId === horseId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newObservation.text.trim()) return

    addObservation({
      horseId,
      date: new Date().toISOString(),
      type: newObservation.type,
      text: newObservation.text,
      attachments: [],
      createdBy: "user-1", // TODO: Get from auth context
      priority: newObservation.priority,
    })

    setNewObservation({
      type: "NOTE",
      text: "",
      priority: "LOW",
    })
  }

  const getTypeIcon = (type: ObservationType) => {
    switch (type) {
      case "SYMPTOM":
        return <AlertCircle className="h-4 w-4" />
      case "FEEDING":
        return <Utensils className="h-4 w-4" />
      case "WATERING":
        return <Droplets className="h-4 w-4" />
      case "BEHAVIOR":
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: ObservationType) => {
    switch (type) {
      case "NOTE":
        return "Note"
      case "SYMPTOM":
        return "Symptôme"
      case "ENVIRONMENT":
        return "Environnement"
      case "FEEDING":
        return "Alimentation"
      case "WATERING":
        return "Abreuvement"
      case "BEHAVIOR":
        return "Comportement"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">Nouvelle observation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newObservation.type}
              onValueChange={(value) => setNewObservation({ ...newObservation, type: value as ObservationType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTE">Note générale</SelectItem>
                <SelectItem value="SYMPTOM">Symptôme</SelectItem>
                <SelectItem value="ENVIRONMENT">Environnement</SelectItem>
                <SelectItem value="FEEDING">Alimentation</SelectItem>
                <SelectItem value="WATERING">Abreuvement</SelectItem>
                <SelectItem value="BEHAVIOR">Comportement</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newObservation.priority}
              onValueChange={(value) => setNewObservation({ ...newObservation, priority: value as Priority })}
            >
              <SelectTrigger>
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

          <Textarea
            value={newObservation.text}
            onChange={(e) => setNewObservation({ ...newObservation, text: e.target.value })}
            placeholder="Décrivez votre observation..."
            rows={3}
            required
          />

          <Button type="submit" className="w-full">
            Ajouter l'observation
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {horseObservations.map((obs) => {
          const priorityColor = getPriorityColor(obs.priority)

          return (
            <Card key={obs.id} className={`p-4 border-l-4 ${priorityColor}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeIcon(obs.type)}
                    <Badge variant="outline">{getTypeLabel(obs.type)}</Badge>
                    <Badge variant="outline" className={priorityColor}>
                      {obs.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(obs.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-foreground">{obs.text}</p>
                </div>
              </div>
            </Card>
          )
        })}

        {horseObservations.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune observation enregistrée</p>
          </Card>
        )}
      </div>
    </div>
  )
}
