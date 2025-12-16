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

export function AddMedicalRecordDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <form className="space-y-4">
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">
              Type d'acte
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="deworming">Vermifuge</SelectItem>
                <SelectItem value="dental">Dentaire</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="treatment">Traitement</SelectItem>
                <SelectItem value="surgery">Chirurgie</SelectItem>
                <SelectItem value="farrier">Maréchalerie</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
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
            <Label htmlFor="veterinarian" className="text-foreground">
              Vétérinaire / Praticien
            </Label>
            <Input
              id="veterinarian"
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
              placeholder="Détails de l'acte médical..."
              className="bg-card border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product" className="text-foreground">
              Produit / Médicament (optionnel)
            </Label>
            <Input id="product" placeholder="Nom du produit" className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost" className="text-foreground">
              Coût (optionnel)
            </Label>
            <div className="relative">
              <Input
                id="cost"
                type="number"
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
            <Input id="next-date" type="date" className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Documents (optionnel)</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Joindre des fichiers
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
