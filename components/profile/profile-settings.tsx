"use client"

import { useState, useEffect, useCallback, useTransition, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Save, Instagram, Linkedin, Globe, MapPin, AtSign } from "lucide-react"
import { UserProfile } from "@/contexts/profile-context"

interface ProfileSettingsProps {
  profile: UserProfile | null
  onUpdate: (updatedProfile: Partial<UserProfile>) => void
}

export function ProfileSettings({ profile, onUpdate }: ProfileSettingsProps) {
  const { toast } = useToast()
  const [username, setUsername] = useState(profile?.username || "")
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [instagram, setInstagram] = useState(profile?.instagram || "")
  const [snapchat, setSnapchat] = useState(profile?.snapchat || "")
  const [linkedin, setLinkedin] = useState(profile?.linkedin || "")
  const [website, setWebsite] = useState(profile?.website || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // useTransition pour garder l'UI fluide pendant les opérations non-critiques
  const [isPending, startTransition] = useTransition()

  // Mettre à jour les états si le profil change
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setDisplayName(profile.display_name || "")
      setBio(profile.bio || "")
      setInstagram(profile.instagram || "")
      setSnapchat(profile.snapchat || "")
      setLinkedin(profile.linkedin || "")
      setWebsite(profile.website || "")
      setLocation(profile.location || "")
      setAvatarUrl(profile.avatar_url || "")
    }
  }, [profile])

  // Mémoriser les initiales pour éviter recalcul à chaque render
  const userInitials = useMemo(() => {
    if (displayName) {
      return displayName
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
  }, [displayName, profile?.email])

  // Handler optimisé pour le changement d'avatar - preview instantanée
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation rapide avant toute opération
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image",
        variant: "destructive",
      })
      return
    }

    // Stocker le fichier immédiatement
    setAvatarFile(file)
    
    // Créer la preview avec URL.createObjectURL (synchrone, plus rapide que FileReader)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    
    // Cleanup de l'ancien objectURL au prochain changement
    return () => URL.revokeObjectURL(objectUrl)
  }, [toast])

  // Handler upload avatar avec optimistic UI
  const handleUploadAvatar = useCallback(async () => {
    if (!avatarFile || !previewUrl) return

    // 1. IMMÉDIAT: feedback visuel
    setUploading(true)
    
    // 2. OPTIMISTIC: garder la preview comme nouvel avatar (déjà affichée)
    const optimisticUrl = previewUrl
    
    // 3. Sauvegarder l'ancien état pour rollback
    const previousAvatarUrl = avatarUrl

    // 4. Clear le fichier sélectionné immédiatement (UX: bouton disparaît)
    setAvatarFile(null)

    try {
      const formData = new FormData()
      formData.append("avatar", avatarFile)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'upload")
      }

      // 5. SUCCESS: mettre à jour avec l'URL réelle du serveur
      setAvatarUrl(data.avatarUrl)
      setPreviewUrl(null)
      onUpdate({ avatar_url: data.avatarUrl })

      toast({
        title: "Succès",
        description: "Photo de profil mise à jour",
      })
    } catch (error: any) {
      // 6. ROLLBACK: restaurer l'état précédent
      setAvatarUrl(previousAvatarUrl)
      setPreviewUrl(null)
      setAvatarFile(null)
      
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }, [avatarFile, previewUrl, avatarUrl, onUpdate, toast])

  // Handler save avec OPTIMISTIC UI - l'UI change AVANT la réponse serveur
  const handleSave = useCallback(async () => {
    // 1. IMMÉDIAT: feedback visuel (spinner)
    setSaving(true)

    // 2. Préparer les données une seule fois
    const updatedData = {
      username: username.trim() || undefined,
      display_name: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
      instagram: instagram.trim() || undefined,
      snapchat: snapchat.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      website: website.trim() || undefined,
      location: location.trim() || undefined,
    }

    // 3. OPTIMISTIC UPDATE: mettre à jour l'UI IMMÉDIATEMENT
    // L'utilisateur voit le changement sans attendre le réseau
    startTransition(() => {
      onUpdate(updatedData)
    })

    // 4. Sauvegarder l'état actuel pour rollback en cas d'erreur
    const previousState = {
      username: profile?.username,
      display_name: profile?.display_name,
      bio: profile?.bio,
      instagram: profile?.instagram,
      snapchat: profile?.snapchat,
      linkedin: profile?.linkedin,
      website: profile?.website,
      location: profile?.location,
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim() || null,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          instagram: instagram.trim() || null,
          snapchat: snapchat.trim() || null,
          linkedin: linkedin.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde")
      }

      // 5. SUCCESS: toast de confirmation (UI déjà à jour)
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      })
    } catch (error: any) {
      // 6. ROLLBACK: restaurer l'état précédent en cas d'erreur
      startTransition(() => {
        onUpdate(previousState)
      })
      
      // Restaurer aussi les inputs locaux
      setUsername(previousState.username || "")
      setDisplayName(previousState.display_name || "")
      setBio(previousState.bio || "")
      setInstagram(previousState.instagram || "")
      setSnapchat(previousState.snapchat || "")
      setLinkedin(previousState.linkedin || "")
      setWebsite(previousState.website || "")
      setLocation(previousState.location || "")
      
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [
    username, displayName, bio, instagram, snapchat, linkedin, website, location,
    profile, onUpdate, toast, startTransition
  ])

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Section Photo de profil */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Photo de profil
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0">
              <AvatarImage 
                src={previewUrl || avatarUrl || profile?.avatar_url} 
                alt="Avatar" 
              />
              <AvatarFallback className="text-xl sm:text-2xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full sm:w-auto space-y-2 sm:space-y-3">
              {/* Boutons en colonne sur mobile, row sur desktop */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={uploading}
                  className="w-full sm:w-auto h-10 sm:h-9"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une photo
                </Button>
                {avatarFile && (
                  <Button
                    size="sm"
                    onClick={handleUploadAvatar}
                    disabled={uploading}
                    className="w-full sm:w-auto h-10 sm:h-9"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                )}
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                JPG, PNG ou GIF. Max 5 Mo.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Informations personnelles
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="username" className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <AtSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Pseudo (unique)
                  </div>
                </Label>
                <Input
                  id="username"
                  placeholder="votre_pseudo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={30}
                  autoComplete="username"
                  className="h-10 sm:h-9"
                />
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Lettres, chiffres et _ uniquement
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="display-name" className="text-sm">Nom d'affichage</Label>
                <Input
                  id="display-name"
                  placeholder="Votre nom complet"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  autoComplete="name"
                  className="h-10 sm:h-9"
                />
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Affiché sur votre profil
                </p>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="location" className="text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Localisation
                </div>
              </Label>
              <Input
                id="location"
                placeholder="Ex: Paris, France"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                autoComplete="address-level2"
                className="h-10 sm:h-9"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="bio" className="text-sm">Bio / Présentation</Label>
              <Textarea
                id="bio"
                placeholder="Parlez-nous de vous..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                className="resize-none min-h-[80px] sm:min-h-[100px]"
              />
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {bio.length}/200 caractères
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted h-10 sm:h-9"
              />
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>
          </div>
        </div>

        {/* Section Réseaux Sociaux */}
        <div className="border-t border-border pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Réseaux sociaux
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="instagram" className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Instagram
                  </div>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">@</span>
                  <Input
                    id="instagram"
                    placeholder="votre_compte"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                    className="pl-7 sm:pl-8 h-10 sm:h-9"
                    maxLength={30}
                    aria-label="Nom d'utilisateur Instagram"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="snapchat" className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.166 3c.796.006 3.327.185 4.907 2.179.976 1.232 1.175 2.893 1.016 4.545l-.005.046c-.025.212-.05.428-.075.646-.022.2.034.327.08.39.075.1.19.168.318.19.12.02.456.084.577.11.34.074.684.21.919.5.229.282.305.586.243.878-.098.447-.487.762-.874 1.019-.043.028-.088.058-.136.088-.165.106-.386.246-.468.35a.397.397 0 0 0-.05.115c-.008.045.003.118.05.2.097.172.39.468.675.757.203.205.42.426.624.66.367.422.6.884.519 1.413-.078.502-.445.9-.86 1.108-.447.226-1.038.273-1.694.243a6.78 6.78 0 0 1-.725-.074c-.166-.025-.342-.05-.533-.073-.164-.019-.273.015-.426.065a2.82 2.82 0 0 1-.115.04c-.13.05-.292.11-.507.181-.45.15-.889.484-1.428 1.07-.315.34-.584.483-.844.483-.025 0-.05-.003-.075-.006-.26-.025-.516-.18-.82-.505-.57-.61-1.004-.934-1.453-1.09a5.01 5.01 0 0 0-.494-.176l-.118-.04c-.15-.049-.259-.083-.426-.065-.19.022-.366.048-.532.073a6.779 6.779 0 0 1-.726.074c-.656.03-1.247-.017-1.695-.243-.414-.207-.78-.606-.859-1.108-.08-.529.152-.99.52-1.413.203-.234.42-.455.624-.66.285-.29.578-.585.674-.757.048-.082.06-.155.05-.2a.398.398 0 0 0-.05-.115c-.08-.104-.302-.244-.467-.35-.048-.03-.093-.06-.137-.088-.386-.257-.775-.572-.873-1.019-.062-.292.014-.596.242-.878.236-.29.58-.426.92-.5.12-.026.456-.09.577-.11a.575.575 0 0 0 .317-.19c.047-.063.103-.19.081-.39a22.98 22.98 0 0 1-.08-.692c-.159-1.652.04-3.313 1.016-4.545 1.58-1.994 4.11-2.173 4.907-2.179z"/>
                    </svg>
                    Snapchat
                  </div>
                </Label>
                <Input
                  id="snapchat"
                  placeholder="votre_snap"
                  value={snapchat}
                  onChange={(e) => setSnapchat(e.target.value)}
                  maxLength={30}
                  className="h-10 sm:h-9"
                  aria-label="Nom d'utilisateur Snapchat"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="linkedin" className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    LinkedIn
                  </div>
                </Label>
                <Input
                  id="linkedin"
                  placeholder="votre-profil"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  maxLength={100}
                  className="h-10 sm:h-9"
                  inputMode="url"
                  aria-label="Identifiant ou URL LinkedIn"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="website" className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Site web
                  </div>
                </Label>
                <Input
                  id="website"
                  placeholder="votre-site.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={100}
                  className="h-10 sm:h-9"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="URL de votre site web"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer - full width sur mobile */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto sm:min-w-[140px] h-11 sm:h-10 sm:ml-auto sm:flex"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
