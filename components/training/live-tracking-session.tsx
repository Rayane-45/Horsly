"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTrainingStore } from "@/lib/training/store"
import { detectGait } from "@/lib/integrations/gait-detector"
import { Play, Pause, Square, MapPin, Activity, Clock, Zap } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import("@/components/training/live-map"), { ssr: false })

interface LiveTrackingSessionProps {
  sessionId: string
  horseId: string
  onComplete: () => void
}

export function LiveTrackingSession({ sessionId, horseId, onComplete }: LiveTrackingSessionProps) {
  const { updateSession } = useTrainingStore()
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [currentGait, setCurrentGait] = useState<"WALK" | "TROT" | "CANTER" | "GALLOP">("WALK")
  const [trackPoints, setTrackPoints] = useState<Array<{ lat: number; lng: number; timestamp: number }>>([])
  const [gpsError, setGpsError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const lastPointRef = useRef<{ lat: number; lng: number } | null>(null)

  // Request location permissions and start tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    try {
      // Request permission
      const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName })
      if (permission.state === "denied") {
        setGpsError("Permission de localisation refusée. Veuillez l'activer dans les paramètres.")
        return
      }

      setIsTracking(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      setGpsError(null)

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords
          const timestamp = Date.now()

          // Add point to track
          const newPoint = { lat: latitude, lng: longitude, timestamp }
          setTrackPoints((prev) => [...prev, newPoint])

          // Calculate distance if we have a previous point
          if (lastPointRef.current) {
            const dist = calculateDistance(lastPointRef.current.lat, lastPointRef.current.lng, latitude, longitude)
            setDistance((prev) => prev + dist)
          }

          lastPointRef.current = { lat: latitude, lng: longitude }

          // Update speed and detect gait
          const speedKmh = speed ? speed * 3.6 : 0
          setCurrentSpeed(speedKmh)
          const detectedGait = detectGait(speedKmh)
          setCurrentGait(detectedGait)
        },
        (error) => {
          console.error("[v0] GPS error:", error)
          setGpsError("Erreur GPS: " + error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )
    } catch (error) {
      console.error("[v0] Error starting tracking:", error)
      setGpsError("Impossible de démarrer le suivi GPS")
    }
  }

  // Pause tracking
  const pauseTracking = () => {
    setIsPaused(true)
    pausedTimeRef.current = Date.now()
  }

  // Resume tracking
  const resumeTracking = () => {
    setIsPaused(false)
    const pauseDuration = Date.now() - pausedTimeRef.current
    startTimeRef.current += pauseDuration
  }

  // Stop tracking and complete session
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setIsTracking(false)

    // Update session with final stats
    updateSession(sessionId, {
      status: "DONE",
      end: new Date().toISOString(),
      durationSec: duration,
      distanceM: distance * 1000,
      speedAvgKmh: distance > 0 ? distance / (duration / 3600) : 0,
    })

    onComplete()
  }

  // Update duration timer
  useEffect(() => {
    if (!isTracking || isPaused) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setDuration(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isTracking, isPaused])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

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
      {/* Map */}
      <div className="flex-1 relative">
        <Map trackPoints={trackPoints} />

        {/* GPS Error Banner */}
        {gpsError && (
          <div className="absolute top-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg">
            <p className="text-sm font-medium">{gpsError}</p>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          <Card className="flex-1 p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Durée</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatDuration(duration)}</p>
          </Card>

          <Card className="flex-1 p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{distance.toFixed(2)} km</p>
          </Card>

          <Card className="flex-1 p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Vitesse</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{currentSpeed.toFixed(1)} km/h</p>
          </Card>
        </div>

        {/* Gait Badge */}
        <div className="absolute top-32 left-4">
          <Badge className={`${getGaitColor(currentGait)} text-white text-lg px-4 py-2`}>
            <Zap className="h-4 w-4 mr-2" />
            {currentGait}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex gap-2 justify-center">
          {!isTracking ? (
            <Button size="lg" onClick={startTracking} className="w-full max-w-md">
              <Play className="h-5 w-5 mr-2" />
              Démarrer
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button size="lg" variant="outline" onClick={pauseTracking} className="flex-1 bg-transparent">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button size="lg" onClick={resumeTracking} className="flex-1">
                  <Play className="h-5 w-5 mr-2" />
                  Reprendre
                </Button>
              )}
              <Button size="lg" variant="destructive" onClick={stopTracking} className="flex-1">
                <Square className="h-5 w-5 mr-2" />
                Terminer
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Haversine formula to calculate distance between two GPS points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
