"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Image as ImageIcon, 
  Plus, 
  X,
  Loader2,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HorseAlbumTabProps {
  horseId: string
  horseName: string
}

interface Photo {
  id: string
  url: string
  storage_path: string
  media_type: 'image' | 'video'
  caption?: string
  created_at: string
}

export function HorseAlbumTab({ horseId, horseName }: HorseAlbumTabProps) {
  const { toast } = useToast()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Charger les photos depuis l'API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/horses/${horseId}/photos`)
        
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des photos")
        }

        const data = await response.json()
        setPhotos(data.photos || [])
      } catch (error: any) {
        console.error("Erreur chargement photos:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les photos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [horseId, toast])

  const handleAddPhoto = () => {
    document.getElementById("album-photo-upload")?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    
    // Validation
    if (!isImage && !isVideo) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image ou une vidéo",
        variant: "destructive",
      })
      return
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB pour vidéo, 10MB pour image
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: isVideo ? "La vidéo ne doit pas dépasser 50 Mo" : "L'image ne doit pas dépasser 10 Mo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // 1. Upload du fichier vers Supabase Storage
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload/horse-image", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || "Erreur lors de l'upload")
      }

      const { url, path } = await uploadResponse.json()

      // 2. Enregistrer la photo/vidéo dans la base de données
      const saveResponse = await fetch(`/api/horses/${horseId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          storage_path: path,
          media_type: isVideo ? 'video' : 'image',
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      const { photo } = await saveResponse.json()

      // 3. Ajouter à la liste locale
      setPhotos(prev => [photo, ...prev])
      
      toast({
        title: "Photo ajoutée",
        description: "La photo a été ajoutée à l'album",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la photo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDeletePhoto = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    
    setDeleting(photo.id)

    try {
      // Supprimer via l'API (supprime aussi du storage)
      const response = await fetch(`/api/horses/${horseId}/photos/${photo.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      // Retirer de la liste locale
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null)
      }

      toast({
        title: "Photo supprimée",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 sm:py-6">
      {/* Header avec bouton ajouter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          Album photo {photos.length > 0 && `(${photos.length})`}
        </h3>
        <Button size="sm" onClick={handleAddPhoto} disabled={uploading}>
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          Ajouter
        </Button>
      </div>

      <input
        id="album-photo-upload"
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {photos.length === 0 ? (
       loading ? (
        /* Chargement */
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) :  /* État vide */
        <Card className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Aucun média</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des photos et vidéos de {horseName} pour créer son album
            </p>
            <Button variant="outline" onClick={handleAddPhoto}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un média
            </Button>
          </div>
        </Card>
      ) : (
        /* Grille de photos */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <button
                onClick={() => setSelectedPhoto(photo)}
                className="w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {photo.media_type === 'video' ? (
                  <>
                    <video
                      src={photo.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
              {/* Bouton supprimer */}
              <button
                onClick={(e) => handleDeletePhoto(photo, e)}
                disabled={deleting === photo.id}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer la photo"
              >
                {deleting === photo.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal vue agrandie */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => handleDeletePhoto(selectedPhoto, e)}
            disabled={deleting === selectedPhoto.id}
            className="absolute top-4 left-4 p-2 bg-destructive/80 hover:bg-destructive rounded-full text-white"
          >
            {deleting === selectedPhoto.id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
          {selectedPhoto.media_type === 'video' ? (
            <video
              src={selectedPhoto.url}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={selectedPhoto.url}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  )
}
