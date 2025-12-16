import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface HorseCardMiniProps {
  id: number
  name: string
  image?: string
  breed?: string
  age?: number
  healthStatus: "healthy" | "attention" | "critical"
  hasOverdueEvent?: boolean
}

export function HorseCardMini({ id, name, image, breed, age, healthStatus, hasOverdueEvent }: HorseCardMiniProps) {
  const statusConfig = {
    healthy: {
      label: "Santé OK",
      icon: Heart,
      className: "bg-secondary/10 text-secondary border-secondary/20",
      iconFill: true,
    },
    attention: {
      label: "Attention",
      icon: AlertCircle,
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      iconFill: false,
    },
    critical: {
      label: "Urgent",
      icon: AlertCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
      iconFill: false,
    },
  }

  const config = statusConfig[healthStatus]
  const StatusIcon = config.icon

  return (
    <Link href={`/horses/${id}`}>
      <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <Image
              src={image || "/placeholder.svg?height=80&width=80&query=horse portrait"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-lg truncate">{name}</h3>
              <div className="flex gap-1 flex-shrink-0">
                {hasOverdueEvent && (
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                    <AlertCircle className="h-3 w-3" />
                  </Badge>
                )}
                <Badge variant="secondary" className={config.className}>
                  <StatusIcon className={`h-3 w-3 ${config.iconFill ? "fill-current" : ""}`} />
                </Badge>
              </div>
            </div>

            {(breed || age) && (
              <div className="flex gap-3 text-sm text-muted-foreground">
                {breed && <span>{breed}</span>}
                {age && <span>{age} ans</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
