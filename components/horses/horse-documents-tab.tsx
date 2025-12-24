"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Plus, 
  Upload,
  File,
  Image as ImageIcon,
  Trash2,
  Download,
  Loader2,
  Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HorseDocumentsTabProps {
  horseId: string
  horseName: string
}

interface Document {
  id: string
  name: string
  type: string
  category: string
  url: string
  size: number
  created_at: string
}

const documentCategories = [
  { value: "identity", label: "Pièce d'identité" },
  { value: "health", label: "Santé / Vétérinaire" },
  { value: "insurance", label: "Assurance" },
  { value: "competition", label: "Compétition" },
  { value: "purchase", label: "Achat / Vente" },
  { value: "other", label: "Autre" },
]

export function HorseDocumentsTab({ horseId, horseName }: HorseDocumentsTabProps) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const maxSize = 20 * 1024 * 1024 // 20 Mo
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier ne doit pas dépasser 20 Mo",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    // Pré-remplir le nom si vide
    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et une catégorie",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    // Créer le document localement (API à implémenter)
    const newDocument: Document = {
      id: `temp-${Date.now()}`,
      name: formData.name || selectedFile.name,
      type: selectedFile.type,
      category: formData.category,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
      created_at: new Date().toISOString(),
    }

    setDocuments(prev => [newDocument, ...prev])
    
    // Reset
    setSelectedFile(null)
    setFormData({ name: "", category: "" })
    setUploading(false)
    setShowDialog(false)
    
    toast({
      title: "Document ajouté",
      description: "La gestion des documents sera disponible dans une prochaine version",
    })
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    toast({
      title: "Document supprimé",
      description: "Le document a été retiré",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getCategoryLabel = (category: string) => {
    return documentCategories.find(c => c.value === category)?.label || category
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    return File
  }

  return (
    <div className="p-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Documents</h3>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter
        </Button>
      </div>

      {documents.length === 0 ? (
        /* État vide */
        <Card className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Aucun document</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des documents pour {horseName}
            </p>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </div>
        </Card>
      ) : (
        /* Liste des documents */
        <div className="space-y-2">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.type)
            
            return (
              <Card key={doc.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getCategoryLabel(doc.category)}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(doc.url, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Zone de drop / sélection fichier */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFile 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-lg bg-primary/10">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm truncate px-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Changer de fichier
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez un fichier ou
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("doc-upload")?.click()}
                  >
                    Parcourir
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, images • Max 20 Mo
                  </p>
                </>
              )}
              <input
                id="doc-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-name">Nom du document</Label>
              <Input
                id="doc-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Carte d'identité"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false)
                setSelectedFile(null)
                setFormData({ name: "", category: "" })
              }}
              disabled={uploading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !formData.category}
              className="flex-1"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Téléverser
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
