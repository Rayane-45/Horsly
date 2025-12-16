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
import { Plus } from "lucide-react"

export function AddOrderDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Créer une commande</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enregistrez une nouvelle commande de fournitures
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-foreground">
              Fournisseur
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="agri-supply">Agri Supply</SelectItem>
                <SelectItem value="equi-store">Equi Store</SelectItem>
                <SelectItem value="horse-feed">Horse Feed Pro</SelectItem>
                <SelectItem value="stable-supplies">Stable Supplies</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product" className="text-foreground">
              Produit
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="hay">Foin</SelectItem>
                <SelectItem value="straw">Paille</SelectItem>
                <SelectItem value="bedding">Litière</SelectItem>
                <SelectItem value="feed">Granulés</SelectItem>
                <SelectItem value="supplements">Compléments</SelectItem>
                <SelectItem value="equipment">Équipement</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Quantité
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1"
                className="bg-card border-border text-foreground"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-foreground">
                Unité
              </Label>
              <Select>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="bale">Balle</SelectItem>
                  <SelectItem value="bag">Sac</SelectItem>
                  <SelectItem value="unit">Unité</SelectItem>
                  <SelectItem value="liter">Litre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost" className="text-foreground">
              Coût total
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
            <Label htmlFor="frequency" className="text-foreground">
              Fréquence de commande
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner la fréquence" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="once">Ponctuelle</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="biweekly">Toutes les 2 semaines</SelectItem>
                <SelectItem value="monthly">Mensuelle</SelectItem>
                <SelectItem value="quarterly">Trimestrielle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-date" className="text-foreground">
              Date de livraison prévue
            </Label>
            <Input id="delivery-date" type="date" className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires..."
              className="bg-card border-border text-foreground resize-none"
              rows={2}
            />
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
              Créer la commande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
