"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useTrainingStore } from "@/lib/training/store"
import { LiveSessionScreen, type SessionSummary } from "@/components/training/live-session/live-session-screen"
import { SessionSummaryScreen } from "@/components/training/live-session/session-summary"
import { AlertTriangle } from "lucide-react"

interface RecordPageProps {
  params: Promise<{ id: string }>
}

export default function RecordSessionPage({ params }: RecordPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { liveSession, setLiveSession, addSession, resetPrepState } = useTrainingStore()
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  // Redirect if no live session
  useEffect(() => {
    if (!liveSession || liveSession.id !== id) {
      router.replace("/training/live")
    }
  }, [liveSession, id, router])

  if (!liveSession || liveSession.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Session non trouvée. Redirection...
        </p>
      </div>
    )
  }

  const handleComplete = (sessionSummary: SessionSummary) => {
    setSummary(sessionSummary)
    setLiveSession({
      ...liveSession,
      state: "COMPLETED",
    })
  }

  const handleCancel = () => {
    setLiveSession(null)
    resetPrepState()
    router.replace("/training")
  }

  const handleSave = (notes: string) => {
    if (!summary) return

    // Save session to store
    addSession({
      id: liveSession.id,
      horseId: liveSession.config.horseId,
      title: `Séance ${new Date().toLocaleDateString("fr-FR")}`,
      type: liveSession.config.type || "EXTERIOR",
      mode: "MOUNTED",
      status: "DONE",
      plannedStart: null,
      plannedEnd: null,
      start: liveSession.startedAt,
      end: new Date().toISOString(),
      durationSec: summary.durationSec,
      distanceM: summary.distanceM,
      elevationPosM: 0,
      avgSpeedKmh: summary.avgSpeedKmh,
      maxSpeedKmh: summary.maxSpeedKmh,
      gpsTrackId: null,
      hrAvgBpm: null,
      hrMaxBpm: null,
      hrZones: [],
      gaits: {
        walkSec: summary.gaits.walkSec,
        trotSec: summary.gaits.trotSec,
        canterSec: summary.gaits.canterSec,
        haltSec: 0,
      },
      intervals: [],
      calories: {
        horseKcal: Math.round(summary.distanceM * 0.3),
        riderKcal: Math.round(summary.durationSec * 0.1),
      },
      intensity: summary.avgSpeedKmh > 15 ? "HIGH" : summary.avgSpeedKmh > 8 ? "MODERATE" : "LOW",
      trainingLoad: Math.round(summary.durationSec * summary.avgSpeedKmh / 100),
      rpe: null,
      surface: "TRAIL",
      weather: null,
      notes: notes,
      attachments: [],
      cost: 0,
      currency: "EUR",
      budgetLinked: false,
      budgetOperationId: null,
      shareableImageId: null,
      source: "PHONE_GPS",
      externalRef: null,
      clubId: null,
      createdBy: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Cleanup
    setLiveSession(null)
    resetPrepState()
    router.replace("/training")
  }

  const handleDiscard = () => {
    setLiveSession(null)
    resetPrepState()
    router.replace("/training")
  }

  // Show summary view after completion
  if (summary) {
    return (
      <SessionSummaryScreen
        summary={summary}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    )
  }

  // Show live session
  return (
    <LiveSessionScreen
      config={{
        horseId: liveSession.config.horseId,
        type: liveSession.config.type,
        goal: liveSession.config.goal,
        autoPause: liveSession.config.autoPause ?? false,
        gaitDetection: liveSession.config.gaitDetection ?? true,
        sosShare: liveSession.config.sosShare ?? false,
      }}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
