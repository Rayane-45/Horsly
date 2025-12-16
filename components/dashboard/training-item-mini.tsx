import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import Link from "next/link"

interface TrainingItemMiniProps {
  id: string
  horseName: string
  type: string
  duration: number // minutes
  distance?: number // km
  date: Date
  intensity?: "low" | "medium" | "high"
}

export function TrainingItemMini({ id, horseName, type, duration, distance, date, intensity }: TrainingItemMiniProps) {
  const intensityConfig = {
    low: { label: "Léger", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    medium: { label: "Modéré", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    high: { label: "Intense", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""}`
    }
    return `${mins}min`
  }

  return (
    <Link href={`/training?session=${id}`}>
      <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-foreground truncate">{horseName}</h4>
              {intensity && (
                <Badge variant="outline" className={intensityConfig[intensity].className}>
                  {intensityConfig[intensity].label}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2 truncate">{type}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(duration)}</span>
              </div>
              {distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
