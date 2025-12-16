import { Card } from "@/components/ui/card"
import { Calendar, Syringe, Scissors, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface UpcomingEvent {
  id: string
  type: "training" | "medical" | "farrier" | "competition" | "other"
  title: string
  dueAt: Date
}

interface UpcomingEventsListProps {
  events: UpcomingEvent[]
  limit?: number
}

const eventIcons = {
  training: Calendar,
  medical: Syringe,
  farrier: Scissors,
  competition: TrendingUp,
  other: Calendar,
}

export function UpcomingEventsList({ events, limit = 3 }: UpcomingEventsListProps) {
  const displayEvents = events.slice(0, limit)

  if (displayEvents.length === 0) {
    return (
      <Card className="p-6 bg-card border border-border text-center">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucun événement à venir</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {displayEvents.map((event) => {
        const Icon = eventIcons[event.type]
        const relativeTime = formatDistanceToNow(event.dueAt, { addSuffix: true, locale: fr })

        return (
          <Card key={event.id} className="p-3 bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{relativeTime}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
