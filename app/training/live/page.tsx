"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTrainingStore } from "@/lib/training/store"
import { useGpsWatcher } from "@/hooks/use-gps-watcher"
import { PrepFormPanel } from "@/components/training/live-prep/prep-form-panel"
import { PreviewMapPanel } from "@/components/training/live-prep/preview-map-panel"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Info, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PrepState } from "@/lib/training/types"

export default function LiveTrainingPrep() {
  const router = useRouter()
  const { prepState, setPrepState, resetPrepState, setLiveSession } = useTrainingStore()
  const gps = useGpsWatcher()

  // Initialize prep state on mount
  useEffect(() => {
    if (!prepState) {
      resetPrepState()
    }
  }, [prepState, resetPrepState])

  // Start GPS watcher on mount
  useEffect(() => {
    gps.start()
    return () => {
      gps.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gps.fix) {
      setPrepState((prev) => {
        if (!prev) return prev
        // Only update if position actually changed to avoid unnecessary re-renders
        if (prev.lastPosition?.lat === gps.fix.lat && prev.lastPosition?.lng === gps.fix.lng) {
          return prev
        }
        return {
          ...prev,
          lastPosition: { lat: gps.fix.lat, lng: gps.fix.lng },
        }
      })
    }
  }, [gps.fix, setPrepState])

  const handlePrepChange = (updates: Partial<PrepState>) => {
    if (prepState) {
      setPrepState({ ...prepState, ...updates })
    }
  }

  const handleLaunch = () => {
    if (!prepState || !prepState.horseId || !gps.canStart) return

    // Create live session
    const sessionId = `live-${Date.now()}`
    setLiveSession({
      id: sessionId,
      state: "RUNNING",
      config: {
        horseId: prepState.horseId,
        type: prepState.sessionType,
        goal: prepState.goalValue ? `${prepState.goalType}: ${prepState.goalValue}` : undefined,
        autoPause: prepState.autoPause,
        gaitDetection: prepState.gaitDetection,
        sosShare: prepState.safetyShare,
      },
      samples: [],
      stats: {
        elapsedMs: 0,
        distanceM: 0,
        avgSpeed: 0,
      },
      lastFix: gps.fix
        ? {
            lat: gps.fix.lat,
            lng: gps.fix.lng,
            accuracy: gps.fix.accuracy,
            provider: gps.fix.provider,
          }
        : undefined,
      startedAt: new Date().toISOString(),
    })

    router.push(`/training/record/${sessionId}`)
  }

  if (!prepState) {
    return null
  }

  const canLaunch = prepState.horseId && gps.canStart
  const missingPrerequisites: string[] = []
  if (!prepState.horseId) missingPrerequisites.push("Sélectionnez un cheval")
  if (gps.status === "denied") missingPrerequisites.push("Autorisez l'accès à la localisation")
  if (gps.status === "acquiring") missingPrerequisites.push("En attente du signal GPS...")
  if (gps.status === "timeout") missingPrerequisites.push("Signal GPS faible ou indisponible")
  if ((gps.fix?.accuracy ?? 999) > 25) missingPrerequisites.push("Précision GPS insuffisante (> 25m)")

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Préparer la séance"
        subtitle="Configurez votre séance avant de démarrer"
        actions={
          <div className="flex items-center gap-2">
            {(gps.status === "timeout" || gps.status === "error") && (
              <Button variant="outline" size="sm" onClick={gps.refresh} disabled={gps.retries >= 3}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser GPS ({gps.retries}/3)
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-4">
        {missingPrerequisites.length > 0 && (
          <Alert className="mb-4 max-w-7xl mx-auto">
            <AlertDescription>
              <strong>Conditions manquantes pour démarrer :</strong>
              <ul className="list-disc list-inside mt-2">
                {missingPrerequisites.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-[40%_60%] gap-6 max-w-7xl mx-auto">
          {/* Form Panel */}
          <div>
            <PrepFormPanel
              value={prepState}
              onChange={handlePrepChange}
              onSubmit={handleLaunch}
              canLaunch={canLaunch}
              gpsStatus={gps.status}
              gpsAccuracy={gps.fix?.accuracy ?? null}
            />
          </div>

          {/* Map Panel */}
          <div>
            <PreviewMapPanel
              position={gps.fix ? { lat: gps.fix.lat, lng: gps.fix.lng } : null}
              accuracy={gps.fix?.accuracy ?? null}
              gpsStatus={gps.status}
              batteryLevel={null}
              isOnline={typeof navigator !== "undefined" ? navigator.onLine : true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
