"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function HorseFilter() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un cheval..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-card border-border"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-background border-border">
          <SheetHeader>
            <SheetTitle className="text-foreground">Filtrer les chevaux</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Affinez votre recherche par statut ou caractéristiques
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="text-foreground">Statut de santé</Label>
              <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal text-foreground">
                    Tous
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="healthy" id="healthy" />
                  <Label htmlFor="healthy" className="font-normal text-foreground">
                    En bonne santé
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="attention" id="attention" />
                  <Label htmlFor="attention" className="font-normal text-foreground">
                    Nécessite attention
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border bg-transparent">
                Réinitialiser
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Appliquer</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
