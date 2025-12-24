"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  BookOpen, 
  Plus, 
  Search,
  Calendar,
  Tag,
  Save,
  Loader2,
  Pencil,
  Trash2,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HorseNotesTabProps {
  horseId: string
  horseName: string
}

interface Note {
  id: string
  date: string
  category: string
  title: string
  content: string
  created_at: string
}

const noteCategories = [
  { value: "training", label: "Entraînement", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "behavior", label: "Comportement", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "health", label: "Santé", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "competition", label: "Compétition", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "general", label: "Général", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
]

export function HorseNotesTab({ horseId, horseName }: HorseNotesTabProps) {
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "general",
    title: "",
    content: "",
  })

  // Filtrer les notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchQuery === "" || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = filterCategory === "all" || note.category === filterCategory
      
      return matchesSearch && matchesCategory
    })
  }, [notes, searchQuery, filterCategory])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et le contenu",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    // Créer la note localement (API à implémenter)
    const newNote: Note = {
      id: `temp-${Date.now()}`,
      date: formData.date,
      category: formData.category,
      title: formData.title.trim(),
      content: formData.content.trim(),
      created_at: new Date().toISOString(),
    }

    setNotes(prev => [newNote, ...prev])
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "general",
      title: "",
      content: "",
    })
    
    setSaving(false)
    setShowDialog(false)
    
    toast({
      title: "Note ajoutée",
      description: "Le journal sera disponible dans une prochaine version",
    })
  }

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
    toast({
      title: "Note supprimée",
    })
  }

  const getCategoryConfig = (category: string) => {
    return noteCategories.find(c => c.value === category) || noteCategories[4]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="p-4 sm:py-6 space-y-4">
      {/* Header avec recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {noteCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        /* État vide */
        <Card className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Aucune note</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Tenez un journal pour {horseName}
            </p>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une note
            </Button>
          </div>
        </Card>
      ) : filteredNotes.length === 0 ? (
        /* Aucun résultat */
        <Card className="p-8">
          <div className="text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucune note ne correspond à votre recherche
            </p>
          </div>
        </Card>
      ) : (
        /* Liste des notes */
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const categoryConfig = getCategoryConfig(note.category)
            
            return (
              <Card key={note.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.date)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <h4 className="font-medium text-foreground mb-1">{note.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="note-date">
                  <Calendar className="h-4 w-4 inline mr-1.5" />
                  Date
                </Label>
                <Input
                  id="note-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-category">
                  <Tag className="h-4 w-4 inline mr-1.5" />
                  Catégorie
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-title">Titre *</Label>
              <Input
                id="note-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Séance de dressage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Contenu *</Label>
              <Textarea
                id="note-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Décrivez votre observation..."
                rows={5}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={saving}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
