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
import { Plus, Upload, Loader2 } from "lucide-react"
import { useHorses } from "@/hooks/use-horses"
import { useHealthEvents } from "@/hooks/use-health-events"
import { useExpensesContext } from "@/contexts/expenses-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginDialog } from "@/components/auth/login-dialog"

export function AddMedicalRecordDialog() {
  const [open, setOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [horseId, setHorseId] = useState("")
  const [eventType, setEventType] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [veterinarianName, setVeterinarianName] = useState("")
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState("")
  const [nextDueDate, setNextDueDate] = useState("")
  
  const { user } = useAuth()
  const { horses } = useHorses()
  const { addEvent } = useHealthEvents()
  const { addExpense } = useExpensesContext()
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
    
    if (!horseId || !eventType || !title || !date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Créer l'événement de santé
      await addEvent({
        horse_id: horseId,
        event_type: eventType as any,
        title,
        event_date: new Date(date).toISOString(),
        veterinarian_name: veterinarianName || undefined,
        description: description || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        next_due_date: nextDueDate ? new Date(nextDueDate).toISOString() : undefined,
      })

      // Si un coût est renseigné, créer automatiquement une dépense dans le budget
      if (cost && parseFloat(cost) > 0) {
        const categoryMap: Record<string, string> = {
          vet: "vet",
          vaccine: "vet",
          deworming: "vet",
          dental: "vet",
          illness: "vet",
          injury: "vet",
          farrier: "farrier",
          other: "other",
        }
        
        await addExpense({
          amount: parseFloat(cost),
          category: categoryMap[eventType] || "vet",
          title: `${title}${veterinarianName ? ` - ${veterinarianName}` : ""}`,
          expense_date: date,
          horse_id: horseId,
          notes: description || undefined,
        })
      }

      toast({
        title: "Événement ajouté",
        description: cost ? "L'acte médical et la dépense ont été enregistrés" : "L'événement de santé a été enregistré avec succès",
      })

      // Reset form
      setHorseId("")
      setEventType("")
      setTitle("")
      setVeterinarianName("")
      setDescription("")
      setCost("")
      setNextDueDate("")
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un acte
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nouvel acte médical</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enregistrez un nouveau soin ou traitement
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
              Type d'acte *
            </Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="vet">Vétérinaire</SelectItem>
                <SelectItem value="farrier">Maréchal-ferrant</SelectItem>
                <SelectItem value="vaccine">Vaccination</SelectItem>
                <SelectItem value="deworming">Vermifuge</SelectItem>
                <SelectItem value="dental">Dentaire</SelectItem>
                <SelectItem value="injury">Blessure</SelectItem>
                <SelectItem value="illness">Maladie</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
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
              placeholder="Ex: Visite vétérinaire de contrôle"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

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
            <Label htmlFor="veterinarian" className="text-foreground">
              Vétérinaire / Praticien
            </Label>
            <Input
              id="veterinarian"
              value={veterinarianName}
              onChange={(e) => setVeterinarianName(e.target.value)}
              placeholder="Dr. Martin Dubois"
              className="bg-card border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de l'acte médical..."
              className="bg-card border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost" className="text-foreground">
              Coût (optionnel)
            </Label>
            <div className="relative">
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="pr-8 bg-card border-border text-foreground"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-date" className="text-foreground">
              Prochain rappel (optionnel)
            </Label>
            <Input
              id="next-date"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="bg-card border-border text-foreground"
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
