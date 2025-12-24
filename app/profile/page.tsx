"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { useProfile, UserProfile } from "@/contexts/profile-context"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { User, Settings, Mail, Calendar, Shield, Loader2, MapPin, Instagram, Linkedin, Globe, AtSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading, error, updateProfile } = useProfile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    updateProfile(updatedProfile)
  }

  const getUserInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!mounted || !user) {
    return (
      <AppLayout pageTitle="Profil" pageSubtitle="Gérez vos informations personnelles">
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout pageTitle="Profil" pageSubtitle="Gérez vos informations personnelles">
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout pageTitle="Profil" pageSubtitle="Gérez vos informations personnelles">
        <Card className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Profil" pageSubtitle="Gérez vos informations personnelles">
      <div className="space-y-4 sm:space-y-6">
        {/* Carte de profil principale - padding réduit sur mobile */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Avatar centré sur mobile */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0">
              <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || "Avatar"} />
              <AvatarFallback className="text-xl sm:text-2xl font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left min-w-0">
              {/* Nom + Badge - flex-wrap pour éviter débordement */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {profile?.display_name || "Cavalier"}
                </h2>
                {profile?.is_admin && (
                  <Badge variant="destructive" className="flex items-center gap-1 shrink-0">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              
              {profile?.username && (
                <p className="text-sm text-primary font-medium mb-2">@{profile.username}</p>
              )}
              
              {/* Infos compactes sur mobile */}
              <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>Membre depuis le {profile?.created_at && formatDate(profile.created_at)}</span>
                </div>
              </div>

              {profile?.bio && (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {/* Réseaux sociaux - zones tactiles 44px, espacement correct */}
              {(profile?.instagram || profile?.snapchat || profile?.linkedin || profile?.website) && (
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-3 sm:mt-4">
                  {profile?.instagram && (
                    <Link 
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Instagram: @${profile.instagram}`}
                      className="flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </Link>
                  )}
                  {profile?.snapchat && (
                    <button
                      type="button"
                      aria-label={`Snapchat: ${profile.snapchat}`}
                      title={`Snapchat: ${profile.snapchat}`}
                      className="flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-yellow-500 hover:bg-muted/50 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.166 3c.796.006 3.327.185 4.907 2.179.976 1.232 1.175 2.893 1.016 4.545l-.005.046c-.025.212-.05.428-.075.646-.022.2.034.327.08.39.075.1.19.168.318.19.12.02.456.084.577.11.34.074.684.21.919.5.229.282.305.586.243.878-.098.447-.487.762-.874 1.019-.043.028-.088.058-.136.088-.165.106-.386.246-.468.35a.397.397 0 0 0-.05.115c-.008.045.003.118.05.2.097.172.39.468.675.757.203.205.42.426.624.66.367.422.6.884.519 1.413-.078.502-.445.9-.86 1.108-.447.226-1.038.273-1.694.243a6.78 6.78 0 0 1-.725-.074c-.166-.025-.342-.05-.533-.073-.164-.019-.273.015-.426.065a2.82 2.82 0 0 1-.115.04c-.13.05-.292.11-.507.181-.45.15-.889.484-1.428 1.07-.315.34-.584.483-.844.483-.025 0-.05-.003-.075-.006-.26-.025-.516-.18-.82-.505-.57-.61-1.004-.934-1.453-1.09a5.01 5.01 0 0 0-.494-.176l-.118-.04c-.15-.049-.259-.083-.426-.065-.19.022-.366.048-.532.073a6.779 6.779 0 0 1-.726.074c-.656.03-1.247-.017-1.695-.243-.414-.207-.78-.606-.859-1.108-.08-.529.152-.99.52-1.413.203-.234.42-.455.624-.66.285-.29.578-.585.674-.757.048-.082.06-.155.05-.2a.398.398 0 0 0-.05-.115c-.08-.104-.302-.244-.467-.35-.048-.03-.093-.06-.137-.088-.386-.257-.775-.572-.873-1.019-.062-.292.014-.596.242-.878.236-.29.58-.426.92-.5.12-.026.456-.09.577-.11a.575.575 0 0 0 .317-.19c.047-.063.103-.19.081-.39a22.98 22.98 0 0 1-.08-.692c-.159-1.652.04-3.313 1.016-4.545 1.58-1.994 4.11-2.173 4.907-2.179z"/>
                      </svg>
                    </button>
                  )}
                  {profile?.linkedin && (
                    <Link 
                      href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Profil LinkedIn: ${profile.linkedin}`}
                      className="flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-blue-600 hover:bg-muted/50 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  )}
                  {profile?.website && (
                    <Link 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Site web: ${profile.website}`}
                      className="flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs pour les différentes sections */}
        <Tabs defaultValue="settings" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Paramètres</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Contact</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <ProfileSettings 
              profile={profile} 
              onUpdate={handleProfileUpdate} 
            />
          </TabsContent>

          <TabsContent value="contact">
            <Card className="p-6">
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Section Contact (À venir)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cette section permettra de gérer vos contacts et vos informations de réseau social.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
