"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Play, AlertCircle } from "lucide-react"
import type { SessionType, PrepState } from "@/lib/training/types"
import type { GpsStatus } from "@/hooks/use-gps-watcher"

interface PrepFormPanelProps {
  value: PrepState
  onChange: (updates: Partial<PrepState>) => void
  onSubmit: () => void
  canLaunch: boolean
  gpsStatus: GpsStatus
  gpsAccuracy: number | null
}

export function PrepFormPanel({ value, onChange, onSubmit, canLaunch, gpsStatus, gpsAccuracy }: PrepFormPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Configuration de la séance</h3>

        {/* Horse Selection */}
        <div className="space-y-2">
          <Label htmlFor="horse">
            Cheval <span className="text-destructive">*</span>
          </Label>
          <Select value={value.horseId || ""} onValueChange={(v) => onChange({ horseId: v })}>
            <SelectTrigger id="horse">
              <SelectValue placeholder="Sélectionner un cheval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horse-1">Thunder</SelectItem>
              <SelectItem value="horse-2">Spirit</SelectItem>
              <SelectItem value="horse-3">Shadow</SelectItem>
            </SelectContent>
          </Select>
          {!value.horseId && <p className="text-xs text-muted-foreground">Requis pour démarrer</p>}
        </div>

        {/* Session Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type d'entraînement</Label>
          <Select value={value.sessionType} onValueChange={(v) => onChange({ sessionType: v as SessionType })}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXTERIOR">Extérieur</SelectItem>
              <SelectItem value="DRESSAGE">Dressage</SelectItem>
              <SelectItem value="CSO">CSO</SelectItem>
              <SelectItem value="ENDURANCE">Endurance</SelectItem>
              <SelectItem value="LEISURE">Balade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <Label>Objectif (optionnel)</Label>
          <div className="flex gap-2">
            <Select
              value={value.goalType || "NONE"}
              onValueChange={(v) => onChange({ goalType: v === "NONE" ? null : (v as "DURATION" | "DISTANCE") })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Aucun</SelectItem>
                <SelectItem value="DURATION">Durée</SelectItem>
                <SelectItem value="DISTANCE">Distance</SelectItem>
              </SelectContent>
            </Select>
            {value.goalType && (
              <Input
                type="number"
                placeholder={value.goalType === "DURATION" ? "Minutes" : "Kilomètres"}
                value={value.goalValue || ""}
                onChange={(e) => onChange({ goalValue: Number.parseFloat(e.target.value) || null })}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Options */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">Options</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-pause">Pause automatique</Label>
            <p className="text-xs text-muted-foreground">Pause quand vous vous arrêtez</p>
          </div>
          <Switch id="auto-pause" checked={value.autoPause} onCheckedChange={(v) => onChange({ autoPause: v })} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gait-detection">Détection des allures</Label>
            <p className="text-xs text-muted-foreground">Analyse automatique des allures</p>
          </div>
          <Switch
            id="gait-detection"
            checked={value.gaitDetection}
            onCheckedChange={(v) => onChange({ gaitDetection: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="safety-share">Partage de position (SOS)</Label>
            <p className="text-xs text-muted-foreground">Partager votre position en cas d'urgence</p>
          </div>
          <Switch id="safety-share" checked={value.safetyShare} onCheckedChange={(v) => onChange({ safetyShare: v })} />
        </div>
      </Card>

      {!canLaunch && (
        <Card className="p-4 bg-yellow-500/10 border-yellow-500">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Conditions non remplies</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {!value.horseId && <li>• Sélectionnez un cheval</li>}
                {gpsStatus === "denied" && <li>• Autorisez l'accès à la localisation</li>}
                {gpsStatus === "acquiring" && <li>• En attente du signal GPS...</li>}
                {gpsStatus === "timeout" && <li>• Signal GPS faible ou indisponible</li>}
                {gpsStatus === "error" && <li>• Erreur GPS</li>}
                {gpsAccuracy !== null && gpsAccuracy > 25 && (
                  <li>• Précision GPS insuffisante ({Math.round(gpsAccuracy)}m, requis ≤25m)</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Launch Button */}
      <Button size="lg" className="w-full" onClick={onSubmit} disabled={!canLaunch}>
        <Play className="h-5 w-5 mr-2" />
        Lancer la séance
      </Button>
    </div>
  )
}
