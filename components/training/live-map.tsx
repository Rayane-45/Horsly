"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface LiveMapProps {
  trackPoints: Array<{ lat: number; lng: number; timestamp: number }>
}

export default function LiveMap({ trackPoints }: LiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || trackPoints.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Calculate bounds
    const lats = trackPoints.map((p) => p.lat)
    const lngs = trackPoints.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Add padding
    const padding = 40
    const latRange = maxLat - minLat || 0.001
    const lngRange = maxLng - minLng || 0.001

    // Convert lat/lng to canvas coordinates
    const toCanvasX = (lng: number) => {
      return padding + ((lng - minLng) / lngRange) * (rect.width - 2 * padding)
    }
    const toCanvasY = (lat: number) => {
      return rect.height - padding - ((lat - minLat) / latRange) * (rect.height - 2 * padding)
    }

    // Draw grid
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * (rect.width - 2 * padding)) / 4
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, rect.height - padding)
      ctx.stroke()

      const y = padding + (i * (rect.height - 2 * padding)) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // Draw track line
    if (trackPoints.length > 1) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()

      trackPoints.forEach((point, i) => {
        const x = toCanvasX(point.lng)
        const y = toCanvasY(point.lat)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw start point
      const startX = toCanvasX(trackPoints[0].lng)
      const startY = toCanvasY(trackPoints[0].lat)
      ctx.fillStyle = "#10b981"
      ctx.beginPath()
      ctx.arc(startX, startY, 6, 0, 2 * Math.PI)
      ctx.fill()

      // Draw current position
      const lastPoint = trackPoints[trackPoints.length - 1]
      const endX = toCanvasX(lastPoint.lng)
      const endY = toCanvasY(lastPoint.lat)
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(endX, endY, 8, 0, 2 * Math.PI)
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()
    } else if (trackPoints.length === 1) {
      // Draw single point
      const x = toCanvasX(trackPoints[0].lng)
      const y = toCanvasY(trackPoints[0].lat)
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [trackPoints])

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden">
      {trackPoints.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">En attente du signal GPS...</p>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
            <div className="font-medium">{trackPoints.length} points</div>
            <div className="text-muted-foreground">
              {trackPoints[trackPoints.length - 1].lat.toFixed(6)}, {trackPoints[trackPoints.length - 1].lng.toFixed(6)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
