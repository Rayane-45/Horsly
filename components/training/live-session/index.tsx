"use client"

import { useState } from "react"
import { PreSessionSetup, type SessionConfig } from "./pre-session-setup"
import { LiveSessionScreen, type SessionSummary } from "./live-session-screen"
import { SessionSummaryScreen } from "./session-summary"
import { useTrainingStore } from "@/lib/training/store"
import { useRouter } from "next/navigation"

type FlowState = "SETUP" | "LIVE" | "SUMMARY"

export function LiveSessionFlow() {
  const router = useRouter()
  const addSession = useTrainingStore((state) => state.addSession)
  const [flowState, setFlowState] = useState<FlowState>("SETUP")
  const [config, setConfig] = useState<SessionConfig | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleStartSession = (sessionConfig: SessionConfig) => {
    const id = `session-${Date.now()}`
    setSessionId(id)
    setConfig(sessionConfig)
    setFlowState("LIVE")

    // Create session in store
    addSession({
      id,
      horseId: sessionConfig.horseId,
      title: `Séance ${sessionConfig.type}`,
      type: sessionConfig.type,
      mode: "MOUNTED",
      status: "ACTIVE",
      plannedStart: null,
      plannedEnd: null,
      start: new Date().toISOString(),
      end: null,
      durationSec: 0,
      distanceM: 0,
      elevationPosM: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      gpsTrackId: null,
      hrAvgBpm: 0,
      hrMaxBpm: 0,
      hrZones: [],
      gaits: {
        walkSec: 0,
        trotSec: 0,
        canterSec: 0,
        haltSec: 0,
      },
      intervals: [],
      calories: {
        horseKcal: 0,
        riderKcal: 0,
      },
      intensity: "MODERATE",
      trainingLoad: 0,
      rpe: 5,
      surface: null,
      weather: null,
      notes: null,
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
  }

  const handleCompleteSession = (sessionSummary: SessionSummary) => {
    setSummary(sessionSummary)
    setFlowState("SUMMARY")
  }

  const handleSaveSession = (notes: string) => {
    if (!sessionId || !summary) return

    // Update session with final data
    useTrainingStore.getState().updateSession(sessionId, {
      status: "DONE",
      end: new Date().toISOString(),
      durationSec: summary.durationSec,
      distanceM: summary.distanceM,
      avgSpeedKmh: summary.avgSpeedKmh,
      maxSpeedKmh: summary.maxSpeedKmh,
      gaits: {
        walkSec: summary.gaits.walkSec,
        trotSec: summary.gaits.trotSec,
        canterSec: summary.gaits.canterSec,
        haltSec: 0,
      },
      notes,
    })

    // Navigate back to training page
    router.push("/training")
  }

  const handleDiscardSession = () => {
    if (sessionId) {
      // Remove session from store
      useTrainingStore.getState().updateSession(sessionId, { status: "CANCELED" })
    }
    router.push("/training")
  }

  const handleCancelSetup = () => {
    router.push("/training")
  }

  if (flowState === "SETUP") {
    return <PreSessionSetup onStart={handleStartSession} onCancel={handleCancelSetup} />
  }

  if (flowState === "LIVE" && config) {
    return <LiveSessionScreen config={config} onComplete={handleCompleteSession} onCancel={handleCancelSetup} />
  }

  if (flowState === "SUMMARY" && summary) {
    return <SessionSummaryScreen summary={summary} onSave={handleSaveSession} onDiscard={handleDiscardSession} />
  }

  return null
}
