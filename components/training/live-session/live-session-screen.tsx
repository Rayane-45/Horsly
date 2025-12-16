"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Play,
  Pause,
  Square,
  MapPin,
  Activity,
  Clock,
  Zap,
  Navigation,
  AlertTriangle,
  Phone,
  Flag,
  Maximize2,
} from "lucide-react"
import { detectGait } from "@/lib/integrations/gait-detector"
import type { SessionConfig } from "./pre-session-setup"
import dynamic from "next/dynamic"

const LiveMap = dynamic(() => import("./live-map-canvas"), { ssr: false })

interface LiveSessionScreenProps {
  config: SessionConfig
  onComplete: (summary: SessionSummary) => void
  onCancel: () => void
}

export interface SessionSummary {
  durationSec: number
  distanceM: number
  avgSpeedKmh: number
  maxSpeedKmh: number
  trackPoints: TrackPoint[]
  laps: Lap[]
  gaits: GaitStats
}

export interface TrackPoint {
  lat: number
  lng: number
  timestamp: number
  speed: number
  elevation: number
}

export interface Lap {
  number: number
  timestamp: number
  distanceM: number
  durationSec: number
}

export interface GaitStats {
  walkSec: number
  trotSec: number
  canterSec: number
  gallopSec: number
}

type SessionState = "READY" | "ACTIVE" | "PAUSED"

export function LiveSessionScreen({ config, onComplete, onCancel }: LiveSessionScreenProps) {
  const [state, setState] = useState<SessionState>("READY")
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [maxSpeed, setMaxSpeed] = useState(0)
  const [currentGait, setCurrentGait] = useState<"WALK" | "TROT" | "CANTER" | "GALLOP">("WALK")
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([])
  const [laps, setLaps] = useState<Lap[]>([])
  const [gaitStats, setGaitStats] = useState<GaitStats>({
    walkSec: 0,
    trotSec: 0,
    canterSec: 0,
    gallopSec: 0,
  })

  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showKPISheet, setShowKPISheet] = useState(false)
  const [showSOSSheet, setShowSOSSheet] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const lastPointRef = useRef<TrackPoint | null>(null)
  const gaitTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Géolocalisation non supportée")
      return
    }

    setState("ACTIVE")
    startTimeRef.current = Date.now()
    setGpsError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, altitude } = position.coords
        const timestamp = Date.now()
        const speedKmh = speed ? speed * 3.6 : 0

        const newPoint: TrackPoint = {
          lat: latitude,
          lng: longitude,
          timestamp,
          speed: speedKmh,
          elevation: altitude || 0,
        }

        setTrackPoints((prev) => [...prev, newPoint])
        setGpsAccuracy(accuracy)

        // Calculate distance
        if (lastPointRef.current) {
          const dist = calculateDistance(lastPointRef.current.lat, lastPointRef.current.lng, latitude, longitude)
          setDistance((prev) => prev + dist)
        }

        lastPointRef.current = newPoint
        setCurrentSpeed(speedKmh)
        setMaxSpeed((prev) => Math.max(prev, speedKmh))

        // Detect gait
        if (config.gaitDetection) {
          const gait = detectGait(speedKmh)
          setCurrentGait(gait)
        }
      },
      (error) => {
        console.error("[v0] GPS error:", error)
        setGpsError(error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }, [config.gaitDetection])

  // Pause tracking
  const pauseTracking = useCallback(() => {
    setState("PAUSED")
    pausedTimeRef.current = Date.now()
  }, [])

  // Resume tracking
  const resumeTracking = useCallback(() => {
    setState("ACTIVE")
    const pauseDuration = Date.now() - pausedTimeRef.current
    startTimeRef.current += pauseDuration
  }, [])

  // Add lap
  const addLap = useCallback(() => {
    const lapNumber = laps.length + 1
    const lapDistance = distance - (laps[laps.length - 1]?.distanceM || 0)
    const lapDuration = duration - (laps[laps.length - 1]?.durationSec || 0)

    setLaps((prev) => [
      ...prev,
      {
        number: lapNumber,
        timestamp: Date.now(),
        distanceM: lapDistance,
        durationSec: lapDuration,
      },
    ])

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(100)
    }
  }, [laps, distance, duration])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (gaitTimerRef.current) {
      clearInterval(gaitTimerRef.current)
    }

    const summary: SessionSummary = {
      durationSec: duration,
      distanceM: distance * 1000,
      avgSpeedKmh: distance > 0 ? distance / (duration / 3600) : 0,
      maxSpeedKmh: maxSpeed,
      trackPoints,
      laps,
      gaits: gaitStats,
    }

    onComplete(summary)
  }, [duration, distance, maxSpeed, trackPoints, laps, gaitStats, onComplete])

  // Update duration timer
  useEffect(() => {
    if (state !== "ACTIVE") return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setDuration(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  // Update gait stats
  useEffect(() => {
    if (state !== "ACTIVE" || !config.gaitDetection) return

    gaitTimerRef.current = setInterval(() => {
      setGaitStats((prev) => ({
        ...prev,
        walkSec: currentGait === "WALK" ? prev.walkSec + 1 : prev.walkSec,
        trotSec: currentGait === "TROT" ? prev.trotSec + 1 : prev.trotSec,
        canterSec: currentGait === "CANTER" ? prev.canterSec + 1 : prev.canterSec,
        gallopSec: currentGait === "GALLOP" ? prev.gallopSec + 1 : prev.gallopSec,
      }))
    }, 1000)

    return () => {
      if (gaitTimerRef.current) {
        clearInterval(gaitTimerRef.current)
      }
    }
  }, [state, currentGait, config.gaitDetection])

  // Network status
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (gaitTimerRef.current) {
        clearInterval(gaitTimerRef.current)
      }
    }
  }, [])

  // Auto-start
  useEffect(() => {
    if (state === "READY") {
      startTracking()
    }
  }, [state, startTracking])

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const getGaitColor = (gait: string) => {
    switch (gait) {
      case "WALK":
        return "bg-blue-500"
      case "TROT":
        return "bg-yellow-500"
      case "CANTER":
        return "bg-orange-500"
      case "GALLOP":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <LiveMap trackPoints={trackPoints} autoFollow={state === "ACTIVE"} />

        {/* GPS Error Banner */}
        {gpsError && (
          <div className="absolute top-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg z-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">{gpsError}</p>
            </div>
          </div>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-10">
            <p className="text-sm font-medium">Mode hors ligne - Données en cache</p>
          </div>
        )}

        {/* Top Stats Overlay */}
        <div className="absolute top-4 left-4 right-4 flex gap-2 z-10">
          <Card className="flex-1 p-3 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Durée</span>
            </div>
            <p className="text-xl font-bold">{formatDuration(duration)}</p>
          </Card>

          <Card className="flex-1 p-3 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-xl font-bold">{distance.toFixed(2)} km</p>
          </Card>

          <Card className="flex-1 p-3 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-3 w-3" />
              <span className="text-xs">Vitesse</span>
            </div>
            <p className="text-xl font-bold">{currentSpeed.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">km/h</p>
          </Card>
        </div>

        {/* Gait Badge */}
        {config.gaitDetection && (
          <div className="absolute top-32 left-4 z-10">
            <Badge className={`${getGaitColor(currentGait)} text-white text-base px-4 py-2`}>
              <Zap className="h-4 w-4 mr-2" />
              {currentGait}
            </Badge>
          </div>
        )}

        {/* GPS Accuracy */}
        {gpsAccuracy && (
          <div className="absolute top-32 right-4 z-10">
            <Badge variant={gpsAccuracy < 20 ? "default" : "secondary"} className="text-xs">
              GPS: ±{Math.round(gpsAccuracy)}m
            </Badge>
          </div>
        )}

        {/* More Stats Button (Mobile) */}
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-24 right-4 z-10 md:hidden bg-background/95 backdrop-blur-sm"
          onClick={() => setShowKPISheet(true)}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Stats
        </Button>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-background border-t border-border pb-safe">
        <div className="flex gap-2 justify-center items-center max-w-2xl mx-auto">
          {/* SOS Button */}
          <Button variant="destructive" size="lg" className="flex-shrink-0" onClick={() => setShowSOSSheet(true)}>
            <Phone className="h-5 w-5" />
          </Button>

          {/* Main Controls */}
          {state === "READY" || state === "ACTIVE" ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-xs bg-transparent"
                onClick={pauseTracking}
                disabled={state === "READY"}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-shrink-0 bg-transparent"
                onClick={addLap}
                disabled={state !== "ACTIVE"}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button size="lg" className="flex-1 max-w-xs" onClick={resumeTracking}>
              <Play className="h-5 w-5 mr-2" />
              Reprendre
            </Button>
          )}

          <Button variant="destructive" size="lg" className="flex-1 max-w-xs" onClick={stopTracking}>
            <Square className="h-5 w-5 mr-2" />
            Terminer
          </Button>
        </div>
      </div>

      {/* KPI Sheet (Mobile) */}
      <Sheet open={showKPISheet} onOpenChange={setShowKPISheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Statistiques détaillées</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-3">Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Vitesse max</p>
                  <p className="text-2xl font-bold">{maxSpeed.toFixed(1)} km/h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vitesse moy</p>
                  <p className="text-2xl font-bold">
                    {distance > 0 ? (distance / (duration / 3600)).toFixed(1) : "0.0"} km/h
                  </p>
                </div>
              </div>
            </Card>

            {config.gaitDetection && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Allures</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pas</span>
                    <span className="font-medium">{formatDuration(gaitStats.walkSec)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trot</span>
                    <span className="font-medium">{formatDuration(gaitStats.trotSec)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Galop</span>
                    <span className="font-medium">{formatDuration(gaitStats.canterSec)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Galop rapide</span>
                    <span className="font-medium">{formatDuration(gaitStats.gallopSec)}</span>
                  </div>
                </div>
              </Card>
            )}

            {laps.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Tours ({laps.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {laps.map((lap) => (
                    <div key={lap.number} className="flex justify-between items-center text-sm">
                      <span>Tour {lap.number}</span>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>{(lap.distanceM / 1000).toFixed(2)} km</span>
                        <span>{formatDuration(lap.durationSec)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* SOS Sheet */}
      <Sheet open={showSOSSheet} onOpenChange={setShowSOSSheet}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="text-destructive">Assistance d'urgence</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Card className="p-4 bg-destructive/10">
              <p className="text-sm font-medium mb-2">Position actuelle</p>
              {lastPointRef.current && (
                <p className="text-xs text-muted-foreground font-mono">
                  {lastPointRef.current.lat.toFixed(6)}, {lastPointRef.current.lng.toFixed(6)}
                </p>
              )}
            </Card>
            <Button variant="destructive" size="lg" className="w-full">
              <Phone className="h-5 w-5 mr-2" />
              Appeler les secours
            </Button>
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              <Navigation className="h-5 w-5 mr-2" />
              Partager ma position
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-transparent"
              onClick={() => setShowSOSSheet(false)}
            >
              Tout va bien
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
