import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string
}

export function StatTile({ icon: Icon, label, value }: StatTileProps) {
  return (
    <Card className="p-4 bg-card border border-border text-center">
      <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </Card>
  )
}
