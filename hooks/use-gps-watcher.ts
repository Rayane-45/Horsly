"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export type GpsStatus = "idle" | "permission_check" | "acquiring" | "ready" | "denied" | "timeout" | "error"

export type GpsFix = {
  lat: number
  lng: number
  accuracy: number
  provider?: "gps" | "network"
  timestamp: number
}

const MAX_RETRIES = 3
const FIRST_FIX_TIMEOUT_MS = 15000
const ACCURACY_THRESHOLD_M = 25
const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 } // Paris fallback

export function useGpsWatcher() {
  const [fix, setFix] = useState<GpsFix | null>(null)
  const [status, setStatus] = useState<GpsStatus>("idle")
  const [retries, setRetries] = useState(0)

  const watcherRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasReceivedFixRef = useRef(false)

  const stop = useCallback(() => {
    if (watcherRef.current !== null) {
      navigator.geolocation.clearWatch(watcherRef.current)
      watcherRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const start = useCallback(async () => {
    stop()
    hasReceivedFixRef.current = false
    setStatus("permission_check")

    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.log("[v0] Geolocation not available, using fallback")
      setFix({
        ...DEFAULT_CENTER,
        accuracy: 100,
        provider: "network",
        timestamp: Date.now(),
      })
      setStatus("ready")
      return
    }

    // Check permissions
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      })

      if (permissionStatus.state === "denied") {
        console.log("[v0] GPS permission denied")
        setStatus("denied")
        // Provide fallback position even when denied
        setFix({
          ...DEFAULT_CENTER,
          accuracy: 100,
          provider: "network",
          timestamp: Date.now(),
        })
        return
      }
    } catch (err) {
      console.log("[v0] Permission query not supported, proceeding anyway")
    }

    setStatus("acquiring")

    // Set timeout for first fix
    timeoutRef.current = setTimeout(() => {
      if (!hasReceivedFixRef.current) {
        console.log("[v0] GPS timeout after", FIRST_FIX_TIMEOUT_MS, "ms")
        setStatus("timeout")
        // Provide fallback position on timeout
        setFix({
          ...DEFAULT_CENTER,
          accuracy: 100,
          provider: "network",
          timestamp: Date.now(),
        })
      }
    }, FIRST_FIX_TIMEOUT_MS)

    // Start watching position
    watcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        hasReceivedFixRef.current = true

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        const newFix: GpsFix = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy ?? 999,
          provider: "gps",
          timestamp: position.timestamp,
        }

        setFix(newFix)
        setRetries(0)

        // Check if accuracy is good enough
        if (newFix.accuracy <= ACCURACY_THRESHOLD_M) {
          setStatus("ready")
        } else {
          // Still acquiring better accuracy
          setStatus("acquiring")
        }
      },
      (error) => {
        console.log("[v0] GPS error:", error.message, "Code:", error.code)

        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied")
          setFix({
            ...DEFAULT_CENTER,
            accuracy: 100,
            provider: "network",
            timestamp: Date.now(),
          })
        } else if (error.code === error.TIMEOUT) {
          setStatus("timeout")
          setFix({
            ...DEFAULT_CENTER,
            accuracy: 100,
            provider: "network",
            timestamp: Date.now(),
          })
        } else {
          setStatus("error")
          setFix({
            ...DEFAULT_CENTER,
            accuracy: 100,
            provider: "network",
            timestamp: Date.now(),
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
      },
    )
  }, [stop])

  const refresh = useCallback(async () => {
    if (retries < MAX_RETRIES) {
      console.log("[v0] Refreshing GPS, retry", retries + 1, "of", MAX_RETRIES)
      setRetries((prev) => prev + 1)
      await start()
    } else {
      console.log("[v0] Max retries reached, using fallback")
      setStatus("timeout")
      setFix({
        ...DEFAULT_CENTER,
        accuracy: 100,
        provider: "network",
        timestamp: Date.now(),
      })
    }
  }, [retries, start])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    fix,
    status,
    retries,
    start,
    refresh,
    stop,
    canStart: status === "ready" && (fix?.accuracy ?? 999) <= ACCURACY_THRESHOLD_M,
  }
}
