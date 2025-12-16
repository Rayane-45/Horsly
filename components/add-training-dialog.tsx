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

export function AddTrainingDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle séance
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Planifier un entraînement</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez une nouvelle séance d'entraînement
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
              Type d'entraînement
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="dressage">Dressage</SelectItem>
                <SelectItem value="jumping">Saut d'obstacles</SelectItem>
                <SelectItem value="cross">Cross</SelectItem>
                <SelectItem value="flatwork">Travail à plat</SelectItem>
                <SelectItem value="longe">Longe</SelectItem>
                <SelectItem value="trail">Balade</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                Date
              </Label>
              <Input id="date" type="date" className="bg-card border-border text-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">
                Heure
              </Label>
              <Input id="time" type="time" className="bg-card border-border text-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground">
              Durée (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="45"
              className="bg-card border-border text-foreground"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity" className="text-foreground">
              Intensité
            </Label>
            <Select>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Sélectionner l'intensité" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="light">Légère</SelectItem>
                <SelectItem value="moderate">Modérée</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach" className="text-foreground">
              Coach (optionnel)
            </Label>
            <Input id="coach" placeholder="Nom du coach" className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">
              Lieu (optionnel)
            </Label>
            <Input id="location" placeholder="Carrière, manège..." className="bg-card border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective" className="text-foreground">
              Objectif
            </Label>
            <Textarea
              id="objective"
              placeholder="Objectifs de la séance..."
              className="bg-card border-border text-foreground resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Observations, remarques..."
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
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
