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
import { useExpensesContext } from "@/contexts/expenses-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginDialog } from "@/components/auth/login-dialog"

interface AddExpenseDialogProps {
  onSuccess?: () => void
}

export function AddExpenseDialog({ onSuccess }: AddExpenseDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [horseId, setHorseId] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState("")
  
  const { user } = useAuth()
  const { horses } = useHorses()
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
    
    if (!amount || !category || !title) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        title,
        expense_date: date,
        horse_id: horseId === "none" ? undefined : horseId || undefined,
        notes,
      })

      toast({
        title: "Dépense ajoutée",
        description: "La dépense a été enregistrée avec succès",
      })

      // Reset form
      setAmount("")
      setCategory("")
      setHorseId("")
      setTitle("")
      setNotes("")
      setOpen(false)
      
      // Call onSuccess callback if provided
      onSuccess?.()
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none text-xs sm:text-sm h-auto py-2">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Ajouter une dépense</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nouvelle dépense</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enregistrez une nouvelle dépense pour vos chevaux
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Titre *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Visite vétérinaire"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Montant *
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pr-8 bg-card border-border text-foreground"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              Catégorie *
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="veterinaire">Vétérinaire</SelectItem>
                <SelectItem value="marechalerie">Maréchal-ferrant</SelectItem>
                <SelectItem value="alimentation">Alimentation</SelectItem>
                <SelectItem value="pension">Pension</SelectItem>
                <SelectItem value="entrainement">Entraînement</SelectItem>
                <SelectItem value="competition">Compétition</SelectItem>
                <SelectItem value="equipement">Équipement</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="assurance">Assurance</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horse" className="text-foreground">
              Cheval (optionnel)
            </Label>
            <Select value={horseId} onValueChange={setHorseId}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un cheval" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none">Aucun (dépense générale)</SelectItem>
                {horses.map((horse) => (
                  <SelectItem key={horse.id} value={horse.id}>
                    {horse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des détails..."
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
