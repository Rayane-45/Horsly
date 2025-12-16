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
import { Plus, Upload } from "lucide-react"

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une dépense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nouvelle dépense</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enregistrez une nouvelle dépense pour vos chevaux
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Montant
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pr-8 bg-card border-border text-foreground"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              Catégorie
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="pension">Pension</SelectItem>
                <SelectItem value="veterinary">Vétérinaire</SelectItem>
                <SelectItem value="farrier">Maréchal-ferrant</SelectItem>
                <SelectItem value="feed">Alimentation</SelectItem>
                <SelectItem value="training">Entraînement</SelectItem>
                <SelectItem value="competition">Compétition</SelectItem>
                <SelectItem value="equipment">Équipement</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horse" className="text-foreground">
              Cheval
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un cheval" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="1">Luna</SelectItem>
                <SelectItem value="2">Thunder</SelectItem>
                <SelectItem value="all">Tous les chevaux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">
              Date
            </Label>
            <Input id="date" type="date" className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Ajouter des détails..."
              className="bg-card border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Reçu (optionnel)</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Joindre un fichier
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
