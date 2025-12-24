"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface UserProfile {
  id: string
  email: string
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  instagram?: string
  snapchat?: string
  linkedin?: string
  website?: string
  location?: string
  created_at: string
  is_admin?: boolean
}

interface ProfileContextType {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Create profile if it doesn't exist
  const createProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch("/api/profile", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        console.error("[ProfileContext] Error creating profile:", data)
        return null
      }

      return data.profile
    } catch (err) {
      console.error("[ProfileContext] Error creating profile:", err)
      return null
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/profile")
      const data = await response.json()

      // If profile doesn't exist, create it
      if (response.status === 404 && data.code === "PROFILE_NOT_FOUND") {
        console.log("[ProfileContext] Profile not found, creating...")
        const newProfile = await createProfile()
        
        if (newProfile) {
          setProfile(newProfile)
          setError(null)
        } else {
          // Even if creation fails, don't block the user - use minimal profile
          setProfile({
            id: user.id,
            email: user.email || "",
            created_at: new Date().toISOString(),
          })
          setError("Profil créé localement - certaines fonctionnalités peuvent être limitées")
        }
        return
      }

      if (!response.ok) {
        // For other errors, set a user-friendly message
        console.error("[ProfileContext] Error fetching profile:", data)
        setError(data.error || "Erreur lors du chargement du profil")
        // Use minimal profile from auth data
        setProfile({
          id: user.id,
          email: user.email || "",
          created_at: new Date().toISOString(),
        })
        return
      }

      setProfile(data.profile)
      setError(null)
    } catch (err: any) {
      console.error("[ProfileContext] Error fetching profile:", err)
      setError("Erreur de connexion au serveur")
      // Use minimal profile from auth data
      if (user) {
        setProfile({
          id: user.id,
          email: user.email || "",
          created_at: new Date().toISOString(),
        })
      }
    } finally {
      setLoading(false)
    }
  }, [user, createProfile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refetch: fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
