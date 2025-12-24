"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHorses } from "@/hooks/use-horses"
import { Loader2 } from "lucide-react"

interface HorseSelectorProps {
  value: string
  onValueChange: (value: string) => void
  showAllOption?: boolean
  allLabel?: string
  placeholder?: string
  className?: string
  label?: string
}

export function HorseSelector({
  value,
  onValueChange,
  showAllOption = true,
  allLabel = "Tous les chevaux",
  placeholder = "Sélectionner un cheval",
  className = "w-[180px] sm:w-[200px]",
  label,
}: HorseSelectorProps) {
  const { horses, loading } = useHorses()

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${label ? "" : ""}`}>
        {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
        <div className={`${className} h-10 flex items-center justify-center border rounded-md bg-muted/50`}>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const horsesCount = horses.length
  const displayLabel = showAllOption && value === "all" 
    ? `${allLabel} (${horsesCount})`
    : horses.find(h => h.id === value)?.name || placeholder

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${label ? "" : ""}`}>
      {label && <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</span>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${className} h-9 sm:h-10 text-xs sm:text-sm`}>
          <SelectValue placeholder={placeholder}>
            {displayLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all" className="text-sm">
              <span className="flex items-center gap-2">
                🐴 {allLabel}
                <span className="text-muted-foreground text-xs">({horsesCount})</span>
              </span>
            </SelectItem>
          )}
          {horses.map((horse) => (
            <SelectItem key={horse.id} value={horse.id} className="text-sm">
              <span className="flex items-center gap-2">
                {horse.image_url ? (
                  <img 
                    src={horse.image_url} 
                    alt={horse.name} 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                    🐴
                  </span>
                )}
                {horse.name}
              </span>
            </SelectItem>
          ))}
          {horses.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Aucun cheval enregistré
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
