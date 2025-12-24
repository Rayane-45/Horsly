"use client"

import { useState, useCallback, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  MoreVertical, 
  Pencil, 
  Share2, 
  Trash2,
  Camera,
  Loader2,
  X,
  Upload,
  ImageIcon
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Horse {
  id: string
  name: string
  breed?: string
  image_url?: string
  gender?: string
}

interface HorseHeaderProps {
  horse: Horse
  age?: number | null
  onDelete: () => Promise<void>
  onPhotoChange?: (file: File) => Promise<void>
  onPhotoDelete?: () => Promise<void>
}

export function HorseHeader({ horse, age, onDelete, onPhotoChange, onPhotoDelete }: HorseHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(false)

  const handleShare = useCallback(async () => {
    const shareData = {
      title: horse.name,
      text: `Découvrez ${horse.name}${horse.breed ? `, un(e) ${horse.breed}` : ""}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // L'utilisateur a annulé le partage
      }
    } else {
      // Fallback: copier le lien
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      })
    }
  }, [horse, toast])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await onDelete()
      router.push("/horses")
      toast({
        title: "Cheval supprimé",
        description: `${horse.name} a été supprimé avec succès`,
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le cheval",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handlePhotoSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onPhotoChange) return

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image",
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingPhoto(true)
      setShowPhotoDialog(false)
      await onPhotoChange(file)
      toast({
        title: "Photo mise à jour",
        description: "La photo a été enregistrée avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeletePhoto = async () => {
    if (!onPhotoDelete) return

    try {
      setDeletingPhoto(true)
      await onPhotoDelete()
      setShowDeletePhotoDialog(false)
      setShowPhotoDialog(false)
      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la photo",
        variant: "destructive",
      })
    } finally {
      setDeletingPhoto(false)
    }
  }

  const getGenderEmoji = (gender?: string) => {
    switch (gender) {
      case "male": return "♂"
      case "female": return "♀"
      case "gelding": return "⚲"
      default: return ""
    }
  }

  return (
    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <Link href="/horses" className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            <h1 className="text-lg font-semibold truncate flex-1 text-center px-2">
              {horse.name}
            </h1>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/horses/${horse.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Hero section avec photo */}
      <div className="relative max-w-5xl mx-auto">
        {/* Photo principale - aspect ratio 4:3 sur mobile, plus grand sur desktop */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] xl:aspect-[21/9] bg-muted overflow-hidden sm:rounded-b-2xl sm:mx-4 lg:mx-6">
          {horse.image_url ? (
            <img
              src={horse.image_url}
              alt={horse.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <span className="text-8xl sm:text-9xl lg:text-[10rem] opacity-50">🐴</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Bouton options photo */}
          <button
            onClick={() => setShowPhotoDialog(true)}
            disabled={uploadingPhoto}
            className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors disabled:opacity-50"
            aria-label="Options photo"
          >
            {uploadingPhoto ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-foreground animate-spin" />
            ) : (
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Infos sur l'image */}
          <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 lg:bottom-6 lg:left-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
              {horse.name} {getGenderEmoji(horse.gender)}
            </h2>
            <p className="text-white/90 text-sm sm:text-base lg:text-lg drop-shadow">
              {horse.breed || "Race non renseignée"}
              {age !== null && age !== undefined && ` • ${age} an${age > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {horse.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à ce cheval 
              (entraînements, soins, dépenses) seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog options photo */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo de {horse.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 py-4">
            {/* Aperçu de la photo actuelle */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
              {horse.image_url ? (
                <img
                  src={horse.image_url}
                  alt={horse.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handlePhotoSelect}
                disabled={uploadingPhoto}
                className="w-full"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {horse.image_url ? "Changer la photo" : "Ajouter une photo"}
                  </>
                )}
              </Button>

              {horse.image_url && onPhotoDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeletePhotoDialog(true)}
                  disabled={uploadingPhoto || deletingPhoto}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer la photo
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-2">
              Formats acceptés : JPG, PNG, GIF, WebP (max 5 Mo)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression photo */}
      <AlertDialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la photo de profil de {horse.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPhoto}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              disabled={deletingPhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPhoto ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
