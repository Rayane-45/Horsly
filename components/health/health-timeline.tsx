"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthStore } from "@/lib/health/store"
import { getEventStatusColor, getPriorityColor, getCategoryIcon, formatRecurrence } from "@/lib/health/calculations"
import { HealthEventForm } from "./health-event-form"
import { Calendar, User, Euro, Repeat, CheckCircle2, Edit, Trash2 } from "lucide-react"
import type { HealthEvent } from "@/lib/health/types"

interface HealthTimelineProps {
  horseId: string
}

export function HealthTimeline({ horseId }: HealthTimelineProps) {
  const { events, practitioners, markEventDone, deleteEvent } = useHealthStore()
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | undefined>()
  const [formOpen, setFormOpen] = useState(false)

  const horseEvents = events
    .filter((e) => e.horseId === horseId)
    .sort((a, b) => {
      const dateA = a.plannedDate || a.doneDate || a.createdAt
      const dateB = b.plannedDate || b.doneDate || b.createdAt
      return dateB.localeCompare(dateA)
    })

  const handleEdit = (event: HealthEvent) => {
    setSelectedEvent(event)
    setFormOpen(true)
  }

  const handleMarkDone = (eventId: string) => {
    markEventDone(eventId, new Date().toISOString())
  }

  const handleDelete = (eventId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      deleteEvent(eventId)
    }
  }

  const getPractitionerName = (practitionerId?: string) => {
    if (!practitionerId) return null
    const practitioner = practitioners.find((p) => p.id === practitionerId)
    return practitioner?.name
  }

  return (
    <div className="space-y-4">
      {horseEvents.map((event) => {
        const statusColor = getEventStatusColor(event.status)
        const priorityColor = getPriorityColor(event.priority)
        const icon = getCategoryIcon(event.category)
        const practitionerName = getPractitionerName(event.practitionerId)

        return (
          <Card key={event.id} className={`p-4 border-l-4 ${statusColor}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-foreground">{event.label}</h3>
                  <Badge variant="outline" className={priorityColor}>
                    {event.priority}
                  </Badge>
                  <Badge variant="outline" className={statusColor}>
                    {event.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {event.plannedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Prévu:{" "}
                        {new Date(event.plannedDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {event.doneDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        Fait le:{" "}
                        {new Date(event.doneDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {practitionerName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{practitionerName}</span>
                    </div>
                  )}

                  {event.cost > 0 && (
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span>
                        {event.cost.toFixed(2)} {event.currency}
                        {event.budgetLinked && <span className="text-xs ml-1">(lié au budget)</span>}
                      </span>
                    </div>
                  )}

                  {event.recurrence.type !== "NONE" && (
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      <span>{formatRecurrence(event.recurrence)}</span>
                    </div>
                  )}
                </div>

                {event.notes && <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{event.notes}</p>}
              </div>

              <div className="flex flex-col gap-2">
                {event.status === "PLANNED" && (
                  <Button size="sm" variant="outline" onClick={() => handleMarkDone(event.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Fait
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )
      })}

      {horseEvents.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aucun événement de santé enregistré</p>
        </Card>
      )}

      <HealthEventForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setSelectedEvent(undefined)
        }}
        event={selectedEvent}
        horseId={horseId}
      />
    </div>
  )
}
