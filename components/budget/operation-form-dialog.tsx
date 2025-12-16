"use client"

import type React from "react"

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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, X } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import type { Operation, OperationType, PaymentMethod } from "@/lib/budget/types"

interface OperationFormDialogProps {
  operation?: Operation
  trigger?: React.ReactNode
}

export function OperationFormDialog({ operation, trigger }: OperationFormDialogProps) {
  const [open, setOpen] = useState(false)
  const { accounts, categories, addOperation, updateOperation } = useBudgetStore()

  const [formData, setFormData] = useState({
    accountId: operation?.accountId || "defaultAccountId",
    horseId: operation?.horseId || "defaultHorseId",
    type: operation?.type || ("EXPENSE" as OperationType),
    amount: operation?.amount || 0,
    operationDate: operation?.operationDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    label: operation?.label || "defaultLabel",
    categoryId: operation?.categoryId || "defaultCategoryId",
    subcategoryId: operation?.subcategoryId || "defaultSubcategoryId",
    note: operation?.note || "defaultNote",
    payee: operation?.payee || "defaultPayee",
    paymentMethod: operation?.paymentMethod || ("" as PaymentMethod | ""),
    tags: operation?.tags || [],
    forecast: operation?.forecast || false,
  })

  const [newTag, setNewTag] = useState("")

  const horses = [
    { id: "1", name: "Luna" },
    { id: "2", name: "Thunder" },
  ]

  const parentCategories = categories.filter((c) => !c.parentId)
  const subcategories = categories.filter((c) => c.parentId === formData.categoryId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const operationData = {
      ...formData,
      amount: Number(formData.amount),
      currency: "EUR" as const,
      operationDate: new Date(formData.operationDate).toISOString(),
      attachments: [],
      source: "MANUAL" as const,
      reconciliation: "NONE" as const,
      status: "OK" as const,
    }

    if (operation) {
      updateOperation(operation.id, operationData)
    } else {
      addOperation(operationData)
    }

    setOpen(false)
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle opération
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {operation ? "Modifier l'opération" : "Nouvelle opération"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enregistrez une dépense, un revenu ou un remboursement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">
                Type d'opération *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as OperationType })}
              >
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="EXPENSE">Dépense</SelectItem>
                  <SelectItem value="INCOME">Revenu</SelectItem>
                  <SelectItem value="REFUND">Remboursement</SelectItem>
                  <SelectItem value="TRANSFER">Virement</SelectItem>
                </SelectContent>
              </Select>
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  className="pr-8 bg-card border-border text-foreground"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account" className="text-foreground">
                Compte *
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData({ ...formData, accountId: value })}
              >
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.label}
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
                value={formData.operationDate}
                onChange={(e) => setFormData({ ...formData, operationDate: e.target.value })}
                className="bg-card border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label" className="text-foreground">
              Libellé *
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Description de l'opération"
              className="bg-card border-border text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Catégorie
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
              >
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-foreground">
                  Sous-catégorie
                </Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {subcategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horse" className="text-foreground">
                Cheval
              </Label>
              <Select value={formData.horseId} onValueChange={(value) => setFormData({ ...formData, horseId: value })}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Sélectionner un cheval" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="defaultHorseId">Tous les chevaux</SelectItem>
                  {horses.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-foreground">
                Moyen de paiement
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
              >
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="CARD">Carte bancaire</SelectItem>
                  <SelectItem value="TRANSFER">Virement</SelectItem>
                  <SelectItem value="CASH">Espèces</SelectItem>
                  <SelectItem value="CHECK">Chèque</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payee" className="text-foreground">
              Bénéficiaire / Payeur
            </Label>
            <Input
              id="payee"
              value={formData.payee}
              onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
              placeholder="Nom du vétérinaire, écurie, etc."
              className="bg-card border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-foreground">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Ajouter un tag"
                className="bg-card border-border text-foreground"
              />
              <Button type="button" onClick={addTag} variant="outline" className="border-border bg-transparent">
                Ajouter
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ajouter des détails supplémentaires..."
              className="bg-card border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/10">
            <div className="space-y-0.5">
              <Label htmlFor="forecast" className="text-foreground font-medium">
                Opération prévisionnelle
              </Label>
              <p className="text-xs text-muted-foreground">Cette opération est une prévision future</p>
            </div>
            <Switch
              id="forecast"
              checked={formData.forecast}
              onCheckedChange={(checked) => setFormData({ ...formData, forecast: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Pièces jointes</Label>
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
              {operation ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
