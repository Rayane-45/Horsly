"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, MapPin, Battery, Wifi, Play } from "lucide-react"
import type { SessionType } from "@/lib/training/types"

interface PreSessionSetupProps {
  onStart: (config: SessionConfig) => void
  onCancel: () => void
}

export interface SessionConfig {
  horseId: string
  type: SessionType
  autoPause: boolean
  gaitDetection: boolean
}

export function PreSessionSetup({ onStart, onCancel }: PreSessionSetupProps) {
  const [horseId, setHorseId] = useState<string>("horse-1")
  const [sessionType, setSessionType] = useState<SessionType>("EXTERIOR")
  const [autoPause, setAutoPause] = useState(true)
  const [gaitDetection, setGaitDetection] = useState(true)

  const [gpsStatus, setGpsStatus] = useState<"checking" | "ok" | "denied" | "unavailable">("checking")
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Check GPS permission
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("unavailable")
      return
    }

    navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
      if (result.state === "granted") {
        setGpsStatus("ok")
      } else if (result.state === "denied") {
        setGpsStatus("denied")
      } else {
        // Prompt for permission
        navigator.geolocation.getCurrentPosition(
          () => setGpsStatus("ok"),
          () => setGpsStatus("denied"),
        )
      }
    })
  }, [])

  // Check battery
  useEffect(() => {
    if ("getBattery" in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
      })
    }
  }, [])

  // Check network
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const canStart = gpsStatus === "ok" && horseId

  const handleStart = () => {
    if (!canStart) return
    onStart({
      horseId,
      type: sessionType,
      autoPause,
      gaitDetection,
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Nouvelle séance en direct</h1>
          <p className="text-muted-foreground">Configurez votre séance avant de démarrer</p>
        </div>

        {/* System Status */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">État du système</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">GPS</span>
            </div>
            {gpsStatus === "checking" && <Badge variant="outline">Vérification...</Badge>}
            {gpsStatus === "ok" && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            )}
            {gpsStatus === "denied" && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Refusé
              </Badge>
            )}
            {gpsStatus === "unavailable" && <Badge variant="destructive">Indisponible</Badge>}
          </div>

          {batteryLevel !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Batterie</span>
              </div>
              <Badge variant={batteryLevel < 20 ? "destructive" : "outline"}>{batteryLevel}%</Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Réseau</span>
            </div>
            <Badge variant={isOnline ? "outline" : "secondary"}>{isOnline ? "En ligne" : "Hors ligne"}</Badge>
          </div>
        </Card>

        {/* GPS Permission Error */}
        {gpsStatus === "denied" && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Permission de localisation requise</p>
                <p className="text-sm text-muted-foreground">
                  Veuillez activer la localisation dans les paramètres de votre navigateur pour utiliser le suivi GPS.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Battery Warning */}
        {batteryLevel !== null && batteryLevel < 20 && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Batterie faible</p>
                <p className="text-sm text-muted-foreground">
                  Votre batterie est faible. Pensez à recharger votre appareil pour éviter une interruption de la
                  séance.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Session Configuration */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">Configuration de la séance</h3>

          <div className="space-y-2">
            <Label htmlFor="horse">Cheval *</Label>
            <Select value={horseId} onValueChange={setHorseId}>
              <SelectTrigger id="horse">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horse-1">Thunder</SelectItem>
                <SelectItem value="horse-2">Spirit</SelectItem>
                <SelectItem value="horse-3">Shadow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d'entraînement</Label>
            <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-pause">Pause automatique</Label>
              <p className="text-xs text-muted-foreground">Pause quand vous vous arrêtez</p>
            </div>
            <Switch id="auto-pause" checked={autoPause} onCheckedChange={setAutoPause} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gait-detection">Détection des allures</Label>
              <p className="text-xs text-muted-foreground">Analyse automatique des allures</p>
            </div>
            <Switch id="gait-detection" checked={gaitDetection} onCheckedChange={setGaitDetection} />
          </div>
        </Card>

        {/* Offline Mode Info */}
        {!isOnline && (
          <Card className="p-4 bg-blue-500/10 border-blue-500">
            <div className="flex gap-3">
              <Wifi className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Mode hors ligne</p>
                <p className="text-xs text-muted-foreground">
                  La carte utilisera les tuiles en cache. Vos données seront synchronisées une fois en ligne.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="max-w-2xl mx-auto w-full pt-6 pb-safe space-y-3">
        <Button size="lg" className="w-full" onClick={handleStart} disabled={!canStart}>
          <Play className="h-5 w-5 mr-2" />
          Démarrer la séance
        </Button>
        <Button size="lg" variant="outline" className="w-full bg-transparent" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
