"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import { buildRRule, expandSeriesPreview, formatRecurrenceDescription } from "@/lib/training/rrule-utils"
import type { RecurrenceFrequency, WeekDay } from "@/lib/training/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RecurrenceFormProps {
  value: {
    isRecurring: boolean
    freq: RecurrenceFrequency
    interval: number
    byDay: WeekDay[]
    byMonthDay?: number
    endType: "never" | "count" | "until"
    count?: number
    until?: string
  }
  startAt: string
  onChange: (value: RecurrenceFormProps["value"]) => void
}

export function RecurrenceForm({ value, startAt, onChange }: RecurrenceFormProps) {
  const [expanded, setExpanded] = useState(value.isRecurring)

  const weekDays: { value: WeekDay; label: string }[] = [
    { value: "MO", label: "Lun" },
    { value: "TU", label: "Mar" },
    { value: "WE", label: "Mer" },
    { value: "TH", label: "Jeu" },
    { value: "FR", label: "Ven" },
    { value: "SA", label: "Sam" },
    { value: "SU", label: "Dim" },
  ]

  const handleRecurringChange = (isRecurring: boolean) => {
    onChange({ ...value, isRecurring })
    setExpanded(isRecurring)
  }

  const handleByDayToggle = (day: WeekDay) => {
    const newByDay = value.byDay.includes(day) ? value.byDay.filter((d) => d !== day) : [...value.byDay, day]
    onChange({ ...value, byDay: newByDay })
  }

  // Generate preview
  const rrule = value.isRecurring
    ? buildRRule({
        freq: value.freq,
        interval: value.interval,
        byDay: value.byDay.length > 0 ? value.byDay : undefined,
        count: value.endType === "count" ? value.count : undefined,
        until: value.endType === "until" ? value.until : undefined,
      })
    : ""

  const preview = value.isRecurring ? expandSeriesPreview(startAt, rrule, "Europe/Paris", 5) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Récurrence</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 text-muted-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <RadioGroup
        value={value.isRecurring ? "recurring" : "oneTime"}
        onValueChange={(v) => handleRecurringChange(v === "recurring")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oneTime" id="oneTime" />
          <Label htmlFor="oneTime" className="font-normal cursor-pointer">
            Ponctuel
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="recurring" id="recurring" />
          <Label htmlFor="recurring" className="font-normal cursor-pointer">
            Récurrent
          </Label>
        </div>
      </RadioGroup>

      {expanded && value.isRecurring && (
        <Card className="p-4 space-y-4 bg-muted/30 border-border">
          {/* Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Fréquence</Label>
              <Select value={value.freq} onValueChange={(v) => onChange({ ...value, freq: v as RecurrenceFrequency })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Quotidien</SelectItem>
                  <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                  <SelectItem value="MONTHLY">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Intervalle</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={value.interval}
                onChange={(e) => onChange({ ...value, interval: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Weekly: Day selection */}
          {value.freq === "WEEKLY" && (
            <div className="space-y-2">
              <Label className="text-xs">Jours de la semaine</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={value.byDay.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleByDayToggle(day.value)}
                    className="h-8 w-12"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* End type */}
          <div className="space-y-3">
            <Label className="text-xs">Fin de série</Label>
            <RadioGroup
              value={value.endType}
              onValueChange={(v) => onChange({ ...value, endType: v as "never" | "count" | "until" })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="font-normal cursor-pointer text-sm">
                  Jamais
                </Label>
              </div>

              <div className="flex items-center space-x-2 gap-3">
                <RadioGroupItem value="count" id="count" />
                <Label htmlFor="count" className="font-normal cursor-pointer text-sm">
                  Après
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={value.count || 10}
                  onChange={(e) =>
                    onChange({ ...value, count: Number.parseInt(e.target.value) || 10, endType: "count" })
                  }
                  className="w-20 h-8"
                  disabled={value.endType !== "count"}
                />
                <span className="text-sm text-muted-foreground">occurrences</span>
              </div>

              <div className="flex items-center space-x-2 gap-3">
                <RadioGroupItem value="until" id="until" />
                <Label htmlFor="until" className="font-normal cursor-pointer text-sm">
                  Jusqu'au
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 justify-start text-left font-normal bg-transparent"
                      disabled={value.endType !== "until"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value.until ? format(new Date(value.until), "dd/MM/yyyy", { locale: fr }) : "Choisir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value.until ? new Date(value.until) : undefined}
                      onSelect={(date) => onChange({ ...value, until: date?.toISOString(), endType: "until" })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="pt-3 border-t border-border">
              <Label className="text-xs text-muted-foreground mb-2 block">Aperçu des 5 prochaines occurrences</Label>
              <div className="space-y-1">
                {preview.map((date, i) => (
                  <p key={i} className="text-xs text-foreground">
                    {format(new Date(date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">{formatRecurrenceDescription(rrule)}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
