"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useHorses } from "@/hooks/use-horses"
import { useTrainingSessions } from "@/hooks/use-training-sessions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginDialog } from "@/components/auth/login-dialog"

export function AddTrainingDialog() {
  const [open, setOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [horseId, setHorseId] = useState("")
  const [sessionType, setSessionType] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState("10:00")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  
  const { user } = useAuth()
  const { horses } = useHorses()
  const { addSession } = useTrainingSessions()
  const { toast } = useToast()

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !user) {
      setShowLoginDialog(true)
      return
    }
    setOpen(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!horseId || !sessionType || !title || !date || !time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const startTime = new Date(`${date}T${time}`).toISOString()

      await addSession({
        horse_id: horseId,
        session_type: sessionType,
        title,
        start_time: startTime,
        duration: duration ? parseInt(duration) : undefined,
        intensity: intensity as any,
        location: location || undefined,
        notes: notes || undefined,
      })

      toast({
        title: "Séance ajoutée",
        description: "La séance d'entraînement a été enregistrée avec succès",
      })

      // Reset form
      setHorseId("")
      setSessionType("")
      setTitle("")
      setDuration("")
      setIntensity("")
      setLocation("")
      setNotes("")
      setOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-xs sm:text-sm h-10 sm:h-11">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Planifier un entraînement</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez une nouvelle séance d'entraînement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="horse" className="text-foreground">
              Cheval *
            </Label>
            <Select value={horseId} onValueChange={setHorseId} required>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un cheval" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {horses.map((horse) => (
                  <SelectItem key={horse.id} value={horse.id}>
                    {horse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">
              Type d'entraînement *
            </Label>
            <Select value={sessionType} onValueChange={setSessionType} required>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Dressage">Dressage</SelectItem>
                <SelectItem value="Saut d'obstacles">Saut d'obstacles</SelectItem>
                <SelectItem value="Cross">Cross</SelectItem>
                <SelectItem value="Travail à plat">Travail à plat</SelectItem>
                <SelectItem value="Longe">Longe</SelectItem>
                <SelectItem value="Balade">Balade en extérieur</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Titre *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Séance de dressage"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-card border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">
                Heure *
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-card border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground">
              Durée (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="45"
              className="bg-card border-border text-foreground"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity" className="text-foreground">
              Intensité
            </Label>
            <Select value={intensity} onValueChange={setIntensity}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner l'intensité" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="low">Légère</SelectItem>
                <SelectItem value="medium">Modérée</SelectItem>
                <SelectItem value="high">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">
              Lieu (optionnel)
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Carrière, manège..."
              className="bg-card border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Objectifs, observations, remarques..."
              className="bg-card border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
