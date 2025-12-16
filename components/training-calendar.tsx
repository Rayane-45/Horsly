"use client"

import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrainingSession {
  id: number
  date: string
  type: string
  horse: string
  time: string
}

interface TrainingCalendarProps {
  sessions: TrainingSession[]
}

export function TrainingCalendar({ sessions }: TrainingCalendarProps) {
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  const currentMonth = "Juin 2024"

  // Generate calendar days (simplified - would use date library in production)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1)

  const getSessionsForDay = (day: number) => {
    return sessions.filter((session) => {
      const sessionDay = Number.parseInt(session.date.split(" ")[0])
      return sessionDay === day
    })
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{currentMonth}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const daySessions = getSessionsForDay(day)
          const hasSession = daySessions.length > 0

          return (
            <button
              key={day}
              className={`aspect-square p-1 rounded-lg text-sm transition-colors ${
                hasSession
                  ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                  : "text-foreground hover:bg-accent"
              } ${day === 12 ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day}</span>
                {daySessions.length > 1 && (
                  <span className="text-[10px] text-primary font-normal">{daySessions.length}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
