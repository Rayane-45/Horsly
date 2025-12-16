"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTrainingStore } from "@/lib/training/store"
import { ChevronLeft, ChevronRight, CalendarIcon, Filter, Clock } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { fr } from "date-fns/locale"
import type { CalendarOccurrence, CalendarView } from "@/lib/training/types"

export function TrainingCalendar() {
  const calendarView = useTrainingStore((state) => state.calendarView)
  const setCalendarView = useTrainingStore((state) => state.setCalendarView)
  const calendarDate = useTrainingStore((state) => state.calendarDate)
  const setCalendarDate = useTrainingStore((state) => state.setCalendarDate)
  const calendarFilters = useTrainingStore((state) => state.calendarFilters)

  const [selectedOccurrence, setSelectedOccurrence] = useState<CalendarOccurrence | null>(null)

  // Mock occurrences for demo
  const occurrences: CalendarOccurrence[] = []

  const handlePrevious = () => {
    if (calendarView === "MONTH") {
      setCalendarDate(subMonths(calendarDate, 1))
    }
  }

  const handleNext = () => {
    if (calendarView === "MONTH") {
      setCalendarDate(addMonths(calendarDate, 1))
    }
  }

  const handleToday = () => {
    setCalendarDate(new Date())
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold ml-2">{format(calendarDate, "MMMM yyyy", { locale: fr })}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Select value={calendarView} onValueChange={(v) => setCalendarView(v as CalendarView)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTH">Mois</SelectItem>
              <SelectItem value="WEEK">Semaine</SelectItem>
              <SelectItem value="DAY">Jour</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Calendar Grid (Month View) */}
      {calendarView === "MONTH" && (
        <MonthView date={calendarDate} occurrences={occurrences} onSelectOccurrence={setSelectedOccurrence} />
      )}

      {/* Week View */}
      {calendarView === "WEEK" && (
        <Card className="p-8 text-center bg-card border border-border">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Vue semaine</p>
          <p className="text-sm text-muted-foreground mt-1">En cours de développement</p>
        </Card>
      )}

      {/* Day View */}
      {calendarView === "DAY" && (
        <Card className="p-8 text-center bg-card border border-border">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Vue jour</p>
          <p className="text-sm text-muted-foreground mt-1">En cours de développement</p>
        </Card>
      )}

      {/* Occurrence Detail Sheet */}
      <Sheet open={!!selectedOccurrence} onOpenChange={(open) => !open && setSelectedOccurrence(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Détail de la séance</SheetTitle>
          </SheetHeader>
          {selectedOccurrence && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Titre</p>
                <p className="font-medium">{selectedOccurrence.seriesTitle || "Séance"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cheval</p>
                <p className="font-medium">{selectedOccurrence.horseName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date et heure</p>
                <p className="font-medium">
                  {format(new Date(selectedOccurrence.startAt), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary">{selectedOccurrence.type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge
                  variant={
                    selectedOccurrence.status === "DONE"
                      ? "default"
                      : selectedOccurrence.status === "CANCELED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {selectedOccurrence.status === "DONE"
                    ? "Terminée"
                    : selectedOccurrence.status === "CANCELED"
                      ? "Annulée"
                      : "Planifiée"}
                </Badge>
              </div>
              {selectedOccurrence.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOccurrence.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MonthView({
  date,
  occurrences,
  onSelectOccurrence,
}: {
  date: Date
  occurrences: CalendarOccurrence[]
  onSelectOccurrence: (occ: CalendarOccurrence) => void
}) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  return (
    <Card className="p-4 bg-card border border-border">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayOccurrences = occurrences.filter((occ) => isSameDay(new Date(occ.startAt), day))
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 p-2 border rounded-lg ${
                isToday ? "border-primary bg-primary/5" : "border-border bg-background"
              } ${!isSameMonth(day, date) ? "opacity-40" : ""}`}
            >
              <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayOccurrences.slice(0, 3).map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => onSelectOccurrence(occ)}
                    className="w-full text-left text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
                  >
                    <Clock className="h-3 w-3 inline mr-1" />
                    {format(new Date(occ.startAt), "HH:mm")} {occ.seriesTitle}
                  </button>
                ))}
                {dayOccurrences.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{dayOccurrences.length - 3} autres</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
