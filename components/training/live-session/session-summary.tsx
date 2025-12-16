"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Activity, Zap, Flag, Save, Trash2, Share2, Download } from "lucide-react"
import type { SessionSummary } from "./live-session-screen"
import dynamic from "next/dynamic"

const LiveMap = dynamic(() => import("./live-map-canvas"), { ssr: false })

interface SessionSummaryScreenProps {
  summary: SessionSummary
  onSave: (notes: string) => void
  onDiscard: () => void
}

export function SessionSummaryScreen({ summary, onSave, onDiscard }: SessionSummaryScreenProps) {
  const [notes, setNotes] = useState("")

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const totalGaitTime =
    summary.gaits.walkSec + summary.gaits.trotSec + summary.gaits.canterSec + summary.gaits.gallopSec

  return (
    <div className="min-h-screen bg-background p-4 pb-safe">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Séance terminée</h1>
          <p className="text-muted-foreground">Résumé de votre entraînement</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Durée</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(summary.durationSec)}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-2xl font-bold">{(summary.distanceM / 1000).toFixed(2)} km</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Vitesse moy</span>
            </div>
            <p className="text-2xl font-bold">{summary.avgSpeedKmh.toFixed(1)} km/h</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Vitesse max</span>
            </div>
            <p className="text-2xl font-bold">{summary.maxSpeedKmh.toFixed(1)} km/h</p>
          </Card>
        </div>

        {/* Map */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Parcours</h3>
          <div className="h-64 rounded-lg overflow-hidden">
            <LiveMap trackPoints={summary.trackPoints} autoFollow={false} />
          </div>
        </Card>

        {/* Gaits */}
        {totalGaitTime > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Répartition des allures</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">Pas</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {((summary.gaits.walkSec / totalGaitTime) * 100).toFixed(0)}%
                  </span>
                  <span className="font-medium">{formatDuration(summary.gaits.walkSec)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500 text-white">Trot</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {((summary.gaits.trotSec / totalGaitTime) * 100).toFixed(0)}%
                  </span>
                  <span className="font-medium">{formatDuration(summary.gaits.trotSec)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500 text-white">Galop</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {((summary.gaits.canterSec / totalGaitTime) * 100).toFixed(0)}%
                  </span>
                  <span className="font-medium">{formatDuration(summary.gaits.canterSec)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">Galop rapide</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {((summary.gaits.gallopSec / totalGaitTime) * 100).toFixed(0)}%
                  </span>
                  <span className="font-medium">{formatDuration(summary.gaits.gallopSec)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Laps */}
        {summary.laps.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="h-4 w-4" />
              <h3 className="font-semibold">Tours ({summary.laps.length})</h3>
            </div>
            <div className="space-y-2">
              {summary.laps.map((lap) => (
                <div key={lap.number} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-medium">Tour {lap.number}</span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{(lap.distanceM / 1000).toFixed(2)} km</span>
                    <span>{formatDuration(lap.durationSec)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-4">
          <Label htmlFor="notes" className="mb-2 block">
            Notes de séance
          </Label>
          <Textarea
            id="notes"
            placeholder="Ajoutez vos observations sur cette séance..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={() => onSave(notes)}>
            <Save className="h-5 w-5 mr-2" />
            Enregistrer la séance
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Export GPX
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5 mr-2" />
              Partager
            </Button>
          </div>

          <Button variant="destructive" size="lg" className="w-full" onClick={onDiscard}>
            <Trash2 className="h-5 w-5 mr-2" />
            Supprimer la séance
          </Button>
        </div>
      </div>
    </div>
  )
}
