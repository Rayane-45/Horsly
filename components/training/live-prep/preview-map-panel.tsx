"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Wifi, Battery, AlertCircle, Loader2 } from "lucide-react"

interface PreviewMapPanelProps {
  position: { lat: number; lng: number } | null
  accuracy: number | null
  gpsStatus: "searching" | "ready" | "denied" | "error"
  batteryLevel: number | null
  isOnline: boolean
}

export function PreviewMapPanel({ position, accuracy, gpsStatus, batteryLevel, isOnline }: PreviewMapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [autoCenter, setAutoCenter] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<{ lat: number; lng: number }[]>([])

  // Add breadcrumbs when position updates
  useEffect(() => {
    if (position) {
      setBreadcrumbs((prev) => {
        const newBreadcrumbs = [...prev, position]
        // Keep only last 5 points
        return newBreadcrumbs.slice(-5)
      })
    }
  }, [position])

  // Draw map on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    if (!position) {
      // Show placeholder
      ctx.fillStyle = "#999"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("En attente du signal GPS...", rect.width / 2, rect.height / 2)
      return
    }

    // Calculate bounds
    const allPoints = breadcrumbs.length > 0 ? breadcrumbs : [position]
    const lats = allPoints.map((p) => p.lat)
    const lngs = allPoints.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latRange = maxLat - minLat || 0.001
    const lngRange = maxLng - minLng || 0.001
    const padding = 40

    const toX = (lng: number) => ((lng - minLng) / lngRange) * (rect.width - 2 * padding) + padding
    const toY = (lat: number) => rect.height - (((lat - minLat) / latRange) * (rect.height - 2 * padding) + padding)

    // Draw breadcrumb trail
    if (breadcrumbs.length > 1) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      breadcrumbs.forEach((point, i) => {
        const x = toX(point.lng)
        const y = toY(point.lat)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw start marker
      const startX = toX(breadcrumbs[0].lng)
      const startY = toY(breadcrumbs[0].lat)
      ctx.fillStyle = "#10b981"
      ctx.beginPath()
      ctx.arc(startX, startY, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw accuracy circle
    if (accuracy) {
      const centerX = toX(position.lng)
      const centerY = toY(position.lat)
      // Approximate: 1 degree ≈ 111km, scale to pixels
      const radiusPixels = (accuracy / 111000) * (rect.width / lngRange)
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // Draw current position
    const x = toX(position.lng)
    const y = toY(position.lat)
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw coordinates
    ctx.fillStyle = "#666"
    ctx.font = "11px monospace"
    ctx.textAlign = "right"
    ctx.fillText(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`, rect.width - 10, rect.height - 10)
  }, [position, accuracy, breadcrumbs])

  const handleRecenter = () => {
    setAutoCenter(true)
    // In a real implementation, this would reset the map view
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-[400px] lg:h-[500px]" />

        {/* GPS Status Overlay */}
        {gpsStatus === "searching" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm font-medium">Recherche du signal GPS...</p>
            </div>
          </div>
        )}

        {gpsStatus === "denied" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
            <div className="text-center space-y-3 max-w-sm">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <p className="text-sm font-medium">Localisation refusée</p>
              <p className="text-xs text-muted-foreground">
                Activez la localisation dans les paramètres de votre navigateur
              </p>
            </div>
          </div>
        )}

        {gpsStatus === "error" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
            <div className="text-center space-y-3 max-w-sm">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <p className="text-sm font-medium">Erreur GPS</p>
              <p className="text-xs text-muted-foreground">Impossible d'obtenir votre position</p>
            </div>
          </div>
        )}

        {/* Recenter Button */}
        {position && !autoCenter && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-4 right-4 shadow-lg"
            onClick={handleRecenter}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Recentrer
          </Button>
        )}
      </Card>

      {/* Status Chips */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">GPS</span>
            </div>
            {gpsStatus === "searching" && <Badge variant="outline">Recherche...</Badge>}
            {gpsStatus === "ready" && <Badge className="bg-green-500 text-white">Prêt</Badge>}
            {gpsStatus === "denied" && <Badge variant="destructive">Refusé</Badge>}
            {gpsStatus === "error" && <Badge variant="destructive">Erreur</Badge>}
          </div>

          {accuracy !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Précision</span>
              <Badge variant={accuracy <= 20 ? "outline" : accuracy <= 50 ? "secondary" : "destructive"}>
                ±{accuracy}m
              </Badge>
            </div>
          )}

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
        </div>
      </Card>
    </div>
  )
}
