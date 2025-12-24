import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Syringe, Stethoscope, Activity, Pill } from "lucide-react"
import Link from "next/link"

interface EventCardMiniProps {
  id: string
  type: "vaccine" | "deworming" | "farrier" | "dental" | "vet" | "other"
  horseName: string
  date: Date
  title?: string
}

export function EventCardMini({ id, type, horseName, date, title }: EventCardMiniProps) {
  const typeConfig = {
    vaccine: { label: "Vaccin", icon: Syringe, color: "text-blue-600", bgColor: "bg-blue-500/10" },
    deworming: { label: "Vermifuge", icon: Pill, color: "text-purple-600", bgColor: "bg-purple-500/10" },
    farrier: { label: "Maréchal", icon: Activity, color: "text-orange-600", bgColor: "bg-orange-500/10" },
    dental: { label: "Dentiste", icon: Stethoscope, color: "text-teal-600", bgColor: "bg-teal-500/10" },
    vet: { label: "Vétérinaire", icon: Stethoscope, color: "text-red-600", bgColor: "bg-red-500/10" },
    other: { label: "Autre", icon: Calendar, color: "text-gray-600", bgColor: "bg-gray-500/10" },
  }

  // Utiliser 'other' par défaut si le type n'est pas reconnu
  const config = typeConfig[type] || typeConfig.other
  const Icon = config.icon

  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let dateLabel = ""
  if (diffDays === 0) {
    dateLabel = "Aujourd'hui"
  } else if (diffDays === 1) {
    dateLabel = "Demain"
  } else if (diffDays > 1 && diffDays <= 7) {
    dateLabel = `Dans ${diffDays} jours`
  } else {
    dateLabel = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <Link href={`/sante?event=${id}`}>
      <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer min-h-[88px] flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className={`h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{horseName}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{title || config.label}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
