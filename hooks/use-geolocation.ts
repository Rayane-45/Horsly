"use client"

import { useState, useEffect, useCallback } from 'react'

export interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GeolocationState {
  position: GeolocationPosition | null
  loading: boolean
  error: GeolocationError | null
  permissionDenied: boolean
}

export type GeolocationError = {
  message: string
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED'
}

// Position de fallback (Paris)
const FALLBACK_POSITION: GeolocationPosition = {
  latitude: 48.8566,
  longitude: 2.3522,
}

const CACHE_KEY = 'cavaly_last_position'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24h

interface CachedPosition {
  position: GeolocationPosition
  timestamp: number
}

function getCachedPosition(): GeolocationPosition | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const parsed: CachedPosition = JSON.parse(cached)
    const now = Date.now()
    
    // Vérifier expiration
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return parsed.position
  } catch {
    return null
  }
}

function setCachedPosition(position: GeolocationPosition): void {
  if (typeof window === 'undefined') return
  
  try {
    const cache: CachedPosition = {
      position,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
    permissionDenied: false,
  })

  const requestPosition = useCallback(() => {
    // Reset state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    // Vérifier si geolocation est supportée
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const cached = getCachedPosition()
      setState({
        position: cached || FALLBACK_POSITION,
        loading: false,
        error: {
          message: 'La géolocalisation n\'est pas supportée par votre navigateur',
          code: 'NOT_SUPPORTED',
        },
        permissionDenied: false,
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      // Success
      (pos) => {
        const position: GeolocationPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        
        // Mettre en cache la position
        setCachedPosition(position)
        
        setState({
          position,
          loading: false,
          error: null,
          permissionDenied: false,
        })
      },
      // Error
      (err) => {
        let error: GeolocationError
        let permissionDenied = false
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            error = {
              message: 'Accès à la localisation refusé',
              code: 'PERMISSION_DENIED',
            }
            permissionDenied = true
            break
          case err.POSITION_UNAVAILABLE:
            error = {
              message: 'Position indisponible',
              code: 'POSITION_UNAVAILABLE',
            }
            break
          case err.TIMEOUT:
            error = {
              message: 'Délai de localisation dépassé',
              code: 'TIMEOUT',
            }
            break
          default:
            error = {
              message: 'Erreur de géolocalisation',
              code: 'POSITION_UNAVAILABLE',
            }
        }
        
        // Utiliser le cache ou le fallback
        const cached = getCachedPosition()
        const fallbackPosition = cached || FALLBACK_POSITION
        
        setState({
          position: fallbackPosition,
          loading: false,
          error,
          permissionDenied,
        })
      },
      // Options
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5 minutes
      }
    )
  }, [])

  // Utiliser le fallback Paris
  const useFallback = useCallback(() => {
    setState({
      position: FALLBACK_POSITION,
      loading: false,
      error: null,
      permissionDenied: false,
    })
  }, [])

  // Demander la position au montage
  useEffect(() => {
    requestPosition()
  }, [requestPosition])

  return {
    ...state,
    retry: requestPosition,
    useFallback,
    isFallback: state.position === FALLBACK_POSITION,
  }
}
